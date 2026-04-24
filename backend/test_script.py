import requests
import os
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"
FILE_PATH = r"c:\Users\india\OneDrive - galgotiasuniversity.edu.in\Desktop\AI-Driven Quiz Generation from Presentation Slides\backend\uploads\42273038-6f51-424c-afac-0efc9ee1a3b7.pdf"

print(f"Uploading {FILE_PATH}...")
with open(FILE_PATH, 'rb') as f:
    files = {'file': (os.path.basename(FILE_PATH), f, 'application/pdf')}
    res = requests.post(f"{BASE_URL}/upload", files=files)
    
if res.status_code != 200:
    print("Upload failed:", res.text)
    exit(1)

doc_id = res.json().get("document_id")
print("Upload success! Document ID:", doc_id)

print("Generating quiz...")
payload = {
    "document_id": doc_id,
    "num_questions": 3,
    "difficulty": "Easy",
    "question_types": ["MCQ", "TF"]
}

try:
    gen_res = requests.post(f"{BASE_URL}/generate", json=payload, timeout=120)
    if gen_res.status_code != 200:
        print("Generation failed:", gen_res.text)
    else:
        quiz = gen_res.json()
        print("Generation success! Questions:")
        print(json.dumps(quiz, indent=2))
except Exception as e:
    print("Request failed:", e)
