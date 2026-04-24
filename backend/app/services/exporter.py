import docx
import os
from fpdf import FPDF
from app.models.schemas import QuizQuestion
from typing import List

def export_docx(quiz_data: List[QuizQuestion], filepath: str):
    doc = docx.Document()
    doc.add_heading('Generated Challenge Quiz', 0)
    
    for i, q in enumerate(quiz_data, 1):
        doc.add_heading(f"Q{i}. {q.stem}", level=1)
        if q.type == "MCQ" and q.options:
            for opt in q.options:
                doc.add_paragraph(f"- {opt}")
        doc.add_paragraph(f"Answer: {q.correct_option}")
        doc.add_paragraph(f"Explanation: {q.answer_explanation}")
        doc.add_paragraph(f"Difficulty: {q.difficulty}")
        doc.add_paragraph("---")
        
    doc.save(filepath)
    return filepath

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(80)
        self.cell(30, 10, 'Generated Quiz', 0, 0, 'C')
        self.ln(20)

def export_pdf(quiz_data: List[QuizQuestion], filepath: str):
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    
    for i, q in enumerate(quiz_data, 1):
        # Handle unicode safely by replacing or using basic chars (FPDF1 limitation, but sufficient for MVP)
        stem = str(q.stem).encode('latin-1', 'replace').decode('latin-1')
        pdf.cell(200, 10, text=f"Q{i}. {stem}", new_x="LMARGIN", new_y="NEXT")
        if q.type == "MCQ" and q.options:
            for opt in q.options:
                opt_txt = str(opt).encode('latin-1', 'replace').decode('latin-1')
                pdf.cell(200, 10, text=f"   - {opt_txt}", new_x="LMARGIN", new_y="NEXT")
        ans = str(q.correct_option).encode('latin-1', 'replace').decode('latin-1')
        pdf.cell(200, 10, text=f"Answer: {ans}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)

    pdf.output(filepath)
    return filepath
