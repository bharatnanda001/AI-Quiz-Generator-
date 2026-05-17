# AI-Driven Quiz Generation from Presentation Slides

This is a modern, full-stack web application designed to automatically transform Presentation Slides (PPTX) and PDF documents into comprehensive quiz questions using Artificial Intelligence. By integrating natural language processing and generative AI, the application parses textual data, extracts key concepts, and generates structured Multiple Choice Questions (MCQs), True/False, and Short Answer questions.

## 🚀 Features

- **Automated Text Extraction:** Uses `PyMuPDF` for fast PDF parsing and `python-pptx` for reading slide decks.
- **AI-Powered Keyword Extraction:** Integrates `KeyBERT` (via HuggingFace sentence-transformers) and `spaCy` to identify core concepts and terminology from the uploaded material.
- **Generative AI Quiz Engine:** Connects to **Google's Gemini 2.5 Flash** model using the `google-genai` SDK to dynamically generate contextually accurate questions.
- **Customizable Quizzes:** Users can adjust the difficulty (Easy, Medium, Hard), the number of questions, and the type of questions they want to generate.
- **Robust Error Handling & Fallbacks:** Automatically defaults to graceful fallbacks if the API quota is exhausted or generation fails, ensuring a seamless user experience.
- **Modern UI/UX:** Built with React, Vite, and Tailwind CSS, featuring an intuitive dashboard for file uploads and quiz review.
- **Easy Startup:** Includes a customized `start.ps1` script to effortlessly boot both the backend and frontend simultaneously.

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Lucide React (Icons).
- **Backend:** FastAPI (Python), Uvicorn, Pydantic (Data Validation).
- **AI & NLP:** Google Gemini (`google-genai`), KeyBERT, spaCy (`en_core_web_sm`).
- **Data Parsers:** `PyMuPDF` (`fitz`), `python-pptx`, `pytesseract` (for OCR fallback).

## ⚙️ Prerequisites

1. **Python 3.9+** (For the FastAPI backend)
2. **Node.js 18+** (For the React frontend)
3. **Google Gemini API Key:** Obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **Tesseract OCR (Optional):** Install on your system if you want OCR fallback for image-heavy PDFs.

## 🚀 Getting Started

### 1. Configure the API Key
Navigate to the `backend/` directory and create or update the `.env` file:
```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 2. Install Backend Dependencies
Open a terminal in the `backend/` directory:
```bash
# Create a virtual environment
python -m venv venv
# Activate it (Windows)
venv\Scripts\activate
# Install requirements
pip install -r requirements.txt
# Download the required NLP model
python -m spacy download en_core_web_sm
```

### 3. Install Frontend Dependencies
Open a new terminal in the `frontend/` directory:
```bash
npm install
```

### 4. Run the Application
The project includes an automated startup script for Windows. From the **root** folder, run:
```powershell
.\start.ps1
```
This will automatically launch the backend server on `http://localhost:8001` and open the React frontend in your default browser!

## 🧪 Usage Workflow

1. **Upload:** Drag and drop your PPTX or PDF file into the upload zone.
2. **Configure:** Select your desired difficulty level, question types (MCQ, True/False, Short Answer), and the total number of questions.
3. **Generate:** Click "Generate Quiz". The backend will extract the text, analyze the keywords, and stream the data to Gemini.
4. **Review & Export:** Review the generated questions, their correct answers, and explanations. Finally, export the quiz as a PDF or Word document!

## 🐛 Troubleshooting

- **Port Binding Error [Errno 10048]:** If you see an error indicating that a port is already in use, ensure you don't have other instances running. The backend defaults to `8001` to prevent conflicts with other services.
- **Resource Exhausted (429):** If quiz generation falls back to "Mock Questions", your Gemini API Key has hit its free-tier rate limit. Wait a few minutes or generate a new key.
- **Model Not Found (404):** Ensure you are using the updated `google-genai` SDK and specifying a valid model like `gemini-2.5-flash`.
