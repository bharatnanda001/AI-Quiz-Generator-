from app.services.generator import generate_quiz_payload

res = generate_quiz_payload("This is a test context about AI and machine learning.", ["AI", "ML"], 3, "Easy", ["MCQ"])
print("Result:", res)
