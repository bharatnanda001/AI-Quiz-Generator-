import os
import json
import uuid
import re
import logging
from typing import List
from google import genai
from app.core.config import settings
from app.models.schemas import QuizQuestion
from app.services.validator import validate_question

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize GenAI Client lazily
_client = None

def get_client():
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not set in environment variables!")
            return None
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client

def generate_quiz_payload(text_context: str, keywords: List[str], num_questions: int, difficulty: str, q_types: List[str]) -> List[QuizQuestion]:
    client = get_client()
    if not client:
        return []

    model_name = "gemini-2.0-flash"
    
    prompt = f"""
    You are an AI Quiz Generator. Based on the following presentation slide text and keywords, generate exactly {num_questions} quiz questions.
    The difficulty should be '{difficulty}'.
    The allowed question types are: {', '.join(q_types)}. Mix them up.
    
    CRITICAL INSTRUCTIONS:
    - You MUST output ONLY valid JSON.
    - Each object in the array must follow exactly this schema:
    [
      {{
        "id": "unique-uuid",
        "type": "MCQ" | "TF" | "ShortAnswer",
        "stem": "The actual question text",
        "options": ["Ans1", "Ans2", "Ans3", "Ans4"], // Only for MCQ. Provide exactly 4 options.
        "correct_option": "The exact correct answer as it appears in options, or True/False",
        "answer_explanation": "Why this is correct based on the slide",
        "difficulty": "Easy" | "Medium" | "Hard",
        "confidence_score": 0.95
      }}
    ]

    Keywords: {', '.join(keywords)}
    
    Context Text:
    {text_context}
    """

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        
        raw_text = response.text.strip()
        logger.info(f"DEBUG: Raw Gemini response captured ({len(raw_text)} chars).")
        
        # SAVE RAW DEBUG TO DISK (Using absolute path to avoid crashes)
        try:
            db_dir = os.path.join(os.getcwd(), "db")
            if not os.path.exists(db_dir):
                os.makedirs(db_dir)
            debug_path = os.path.join(db_dir, "raw_debug.txt")
            with open(debug_path, "w", encoding="utf-8") as df:
                df.write(raw_text)
        except Exception as pe:
            logger.warning(f"Failed to write debug log: {pe}")

        # Robust JSON cleaning
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        json_match = re.search(r'\[.*\]', clean_text, re.DOTALL)
        if json_match:
            clean_text = json_match.group(0)
        
        try:
            data = json.loads(clean_text)
        except json.JSONDecodeError as jde:
            logger.error(f"JSON Decode Error: {jde}. Attempting fallback cleaning...")
            clean_text = re.sub(r',\s*\]', ']', clean_text)
            clean_text = re.sub(r',\s*\}', '}', clean_text)
            data = json.loads(clean_text)
        
        valid_questions = []
        for q in data:
            # Fuzzy Map Keys
            if "stem" not in q and "question" in q:
                q["stem"] = q["question"]
            if "options" not in q and "choices" in q:
                q["options"] = q["choices"]
            if "correct_option" not in q and "answer" in q:
                q["correct_option"] = q["answer"]

            if "id" not in q or not q["id"]:
                q["id"] = str(uuid.uuid4())
            
            # Deep clean the correct_option
            if "correct_option" in q:
                orig_ans = str(q["correct_option"])
                clean_ans = re.sub(r'^[A-D\d]\)[\s:]*|^Option\s+[A-D]:\s*|^[A-D]\.\s*', '', orig_ans, flags=re.IGNORECASE)
                q["correct_option"] = clean_ans.strip()

            if validate_question(q, text_context):
                try:
                    if q.get("type") == "MCQ" and not q.get("options"):
                        continue
                    valid_questions.append(QuizQuestion(**q))
                except Exception as ve:
                    logger.error(f"Schema Validation Error: {ve}")
                
        return valid_questions
    except Exception as e:
        logger.error(f"CRITICAL ERROR in Quiz Generation: {e}", exc_info=True)
        logger.info("Falling back to mock quiz generation due to API failure/quota limits.")
        # Fallback to mock data to ensure the app works even when API fails
        mock_questions = []
        for i in range(min(num_questions, 5)):
            mock_questions.append(QuizQuestion(
                id=str(uuid.uuid4()),
                type="MCQ",
                stem=f"What is a key concept identified from the keywords: {', '.join(keywords[:2])}?",
                options=["Concept A", "Concept B", "Concept C", "Concept D"],
                correct_option="Concept A",
                answer_explanation="This is a fallback generated question because the AI API limit was exceeded.",
                difficulty=difficulty,
                confidence_score=0.9
            ))
        return mock_questions
