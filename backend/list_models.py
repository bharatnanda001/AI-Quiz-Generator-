import os
from google import genai

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "AIzaSyAI-6MKbeEf8s2NdPU9E-SgrFTLahkAoRc"))
for m in client.models.list():
    if "generateContent" in m.supported_actions:
        print(m.name)
