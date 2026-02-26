import asyncio
import os
from app.services.ai_resume import AIResumeParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_parsing():
    print("Testing AI Resume Parser...")
    
    # Sample Resume Text
    sample_resume = """
    John Doe
    Software Engineer
    john.doe@example.com
    
    Experience:
    Senior Developer at Tech Corp (2020-Present)
    - Led a team of 5 developers building a React-based dashboard.
    - Optimized backend API performance by 30% using Python and Redis.
    
    Skills: Python, JavaScript, React, FastAPI, Docker, AWS
    
    Projects:
    1. E-commerce Platform: Built a full-stack e-commerce site using Django and React.
    2. AI Chatbot: Developed a chatbot using OpenAI API and Python.
    """
    
    try:
        data = AIResumeParser.parse_resume(sample_resume)
        print("\n--- Parsing Result ---")
        print(data)
        
        # assertions
        assert data['name'] == "John Doe"
        assert "Python" in data['skills']
        assert len(data['projects']) >= 2
        print("\n✅ Test Passed!")
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(test_parsing())
