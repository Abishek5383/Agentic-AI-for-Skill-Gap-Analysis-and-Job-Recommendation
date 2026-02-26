
import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai.errors import ClientError

# Add app directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'app'))

# Load env variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")


def test_model(model_name):
    print(f"\n--- Testing Model: {model_name} ---")
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model_name,
            contents="Hello, are you working?"
        )
        print("Success!")
        print(response.text)
        return True
    except ClientError as e:
        print(f"ClientError: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

# Test gemini-2.0-flash
test_model("gemini-2.0-flash")
