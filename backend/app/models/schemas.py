from typing import List, Optional
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    document_id: str
    message: str

class GenerateQuizRequest(BaseModel):
    document_id: str
    difficulty: str = "Medium"
    question_types: List[str] = ["MCQ", "TF", "ShortAnswer"]
    num_questions: int = 5

class QuestionOptions(BaseModel):
    A: str
    B: str
    C: str
    D: str

class QuizQuestion(BaseModel):
    id: str
    type: str # "MCQ", "TF", "ShortAnswer"
    stem: str
    options: Optional[List[str]] = None
    correct_option: str
    answer_explanation: str
    difficulty: str
    confidence_score: float

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
