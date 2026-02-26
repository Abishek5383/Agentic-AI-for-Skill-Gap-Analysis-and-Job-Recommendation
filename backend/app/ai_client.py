import os
from google import genai
from dotenv import load_dotenv

# Load environment variables explicitly
load_dotenv()

class AIClient:
    _instance = None
    client = None

    @classmethod
    def get_client(cls):
        if cls._instance is None:
            api_key = os.getenv("GEMINI_API_KEY")
            
            # Debugging
            if api_key:
                print(f"DEBUG: AI Client loading key... Found key length: {len(api_key)}")
                try:
                    cls.client = genai.Client(api_key=api_key)
                    print("DEBUG: Gemini Client Initialized Globally")
                except Exception as e:
                    print(f"CRITICAL: Failed to initialize Gemini Client: {e}")
                    cls.client = None
            else:
                print("CRITICAL: GEMINI_API_KEY not found in environment variables")
                cls.client = None
            
            cls._instance = cls
            
        return cls.client

# Create a robust get_client function
def get_ai_client():
    return AIClient.get_client()

MODEL_NAME = "gemini-2.5-flash"
