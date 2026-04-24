from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from app.models.schemas import DocumentResponse, GenerateQuizRequest, QuizResponse, QuizQuestion
from app.services.parser import extract_text
from app.services.nlp import extract_keywords
from app.services.generator import generate_quiz_payload
from app.services.exporter import export_docx, export_pdf
from typing import List
import uuid
import os
import shutil
import json

router = APIRouter()

UPLOAD_DIR = "uploads"
DB_DIR = "db"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentResponse)
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")
    if not file.filename.lower().endswith(('.pdf', '.pptx')):
        raise HTTPException(status_code=400, detail="Only PDF and PPTX files are supported")
    
    document_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{document_id}{ext}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Automatically parse the text and save to a local JSON "db" for the generator
    parsed_text = extract_text(file_path)
    if not parsed_text.strip():
        raise HTTPException(status_code=422, detail="No readable text extracted from document")

    text_path = os.path.join(DB_DIR, f"{document_id}.txt")
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(parsed_text)

    return DocumentResponse(document_id=document_id, message="File uploaded successfully")

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(req: GenerateQuizRequest):
    text_path = os.path.join(DB_DIR, f"{req.document_id}.txt")
    if not os.path.exists(text_path):
        raise HTTPException(status_code=404, detail="Document not found")
        
    with open(text_path, "r", encoding="utf-8") as f:
        parsed_text = f.read()

    # NLP Execution
    keywords = extract_keywords(parsed_text, top_n=12)
    
    # LLM Generator
    try:
        valid_questions = generate_quiz_payload(
            text_context=parsed_text,
            keywords=keywords,
            num_questions=req.num_questions,
            difficulty=req.difficulty,
            q_types=req.question_types
        )
        with open(os.path.join(DB_DIR, "debug_log.txt"), "w") as df:
            df.write(f"Parsed text len: {len(parsed_text)}\nKeywords: {keywords}\nValid questions len: {len(valid_questions)}\n")
    except ValueError as val_err:
        if str(val_err) == "API_RATE_LIMIT":
            raise HTTPException(status_code=429, detail="Gemini API rate limit reached. Please wait a minute and try again.")
        raise
    
    # Save the generated quiz to "DB"
    quiz_path = os.path.join(DB_DIR, f"{req.document_id}_quiz.json")
    with open(quiz_path, "w", encoding="utf-8") as f:
        # Pydantic dump
        json.dump([q.dict() for q in valid_questions], f)

    return QuizResponse(questions=valid_questions)

@router.post("/export/docx")
async def export_quiz_docx(document_id: str):
    quiz_path = os.path.join(DB_DIR, f"{document_id}_quiz.json")
    if not os.path.exists(quiz_path):
        raise HTTPException(status_code=404, detail="Generated quiz not found")
        
    with open(quiz_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    questions = [QuizQuestion(**q) for q in data]
    out_path = os.path.join(DB_DIR, f"{document_id}_export.docx")
    export_docx(questions, out_path)
    
    return FileResponse(out_path, filename="Generated_Quiz.docx")

@router.post("/export/pdf")
async def export_quiz_pdf(document_id: str):
    quiz_path = os.path.join(DB_DIR, f"{document_id}_quiz.json")
    if not os.path.exists(quiz_path):
        raise HTTPException(status_code=404, detail="Generated quiz not found")
        
    with open(quiz_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    questions = [QuizQuestion(**q) for q in data]
    out_path = os.path.join(DB_DIR, f"{document_id}_export.pdf")
    export_pdf(questions, out_path)
    
    return FileResponse(out_path, filename="Generated_Quiz.pdf")
