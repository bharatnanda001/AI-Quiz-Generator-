# AI-Driven Quiz Generation from Presentation Slides

This is a full-stack web application designed to turn PPTX and PDF slides into quiz questions instantly, using FastAPI, React (Vite), spaCy, KeyBERT, and Gemini.

## Prerequisites

1.  Python 3.9+
2.  Node.js (for frontend)
3.  Tesseract OCR (Optional, installed on your system if you want OCR fallback)

## Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment (Optional but recommended):
   ```bash
   cd backend
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install Dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Download the spaCy english model:
   ```bash
   python -m spacy download en_core_web_sm
   ```
5. Ensure your `GEMINI_API_KEY` is inside `backend/.env`. (Already provided!).
6. Download the required SpaCy model:
   ```bash
   python -m spacy download en_core_web_sm
   ```
7. Start the server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *The backend will run on `http://localhost:8000`.*

## Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000` (or whatever port Vite assigns).*

## Testing

*   Navigate to your local frontend.
*   Upload a piece of material (PPTX or PDF).
*   Wait for the processing confirmation.
*   Select difficulty, question amount, and types.
*   Click "Generate Quiz".
*   Review generated questions, and hit PDF or Word to download!
