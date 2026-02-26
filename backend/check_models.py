from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API Key not found")
else:
    try:
        client = genai.Client(api_key=api_key)
        import json
        models = [m.name for m in client.models.list()]
        with open("models.json", "w") as f:
            json.dump(models, f)
        print("Models saved to models.json")
    except Exception as e:
        print(f"Error: {e}")
