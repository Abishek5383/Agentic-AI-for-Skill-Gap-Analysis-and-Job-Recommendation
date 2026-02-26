import os
import json

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

class RoadmapRequest(BaseModel):
    technical_skills: List[str]
    job_role: str

# --------------------------
# FALLBACK / DEFAULT DATA
# --------------------------
# This data is used if AI generation fails or API Key is missing.
JOB_SKILLS = {
    "backend developer": ["python", "fastapi", "django", "sql", "postgresql", "docker", "git", "api design", "redis"],
    "frontend developer": ["react", "javascript", "typescript", "html", "css", "tailwind", "redux", "webpack"],
    "full stack developer": ["react", "node", "express", "mongodb", "javascript", "typescript", "docker", "git"],
    "data scientist": ["python", "pandas", "numpy", "machine learning", "tensorflow", "sql", "statistics", "jupyter"],
    "devops engineer": ["docker", "kubernetes", "aws", "terraform", "jenkins", "linux", "git", "ci/cd"],
    "mobile developer": ["react native", "flutter", "kotlin", "swift", "firebase", "mobile ui", "api integration"],
}

SKILL_RESOURCES = {
    "python": {
        "roadmap": ["Basics (variables, loops, functions)", "OOP (classes, inheritance)", "Advanced (decorators, generators)", "Frameworks (FastAPI/Django)"],
        "websites": ["https://docs.python.org", "https://realpython.com", "https://www.pythontutorial.net"],
        "youtube": [
            "https://www.youtube.com/watch?v=rfscVS0vtbw - Python Full Course (freeCodeCamp)",
            "https://www.youtube.com/watch?v=_uQrJ0TkZlc - Python Tutorial (Programming with Mosh)",
        ]
    },
    "fastapi": {
        "roadmap": ["REST API basics", "CRUD operations", "Database integration", "Authentication", "Deployment"],
        "websites": ["https://fastapi.tiangolo.com", "https://www.freecodecamp.org/news/fastapi-quickstart"],
        "youtube": [
            "https://www.youtube.com/watch?v=0sOvCWFmrtA - FastAPI Course (freeCodeCamp)",
            "https://www.youtube.com/watch?v=7t2alSnE2-I - FastAPI Tutorial (Tech with Tim)",
        ]
    }
    # ... (Other skills would be here, truncated for brevity but functionality remains) ...
}

from google import genai

# ... (other imports)

# --------------------------
# AI CONFIGURATION
# --------------------------
from ..ai_client import get_ai_client, MODEL_NAME

client = get_ai_client()

def generate_ai_roadmap(job_role: str, user_skills: List[str]):
    """Attempts to generate roadmap using Gemini. Returns None on ANY failure."""
    if not client:
        return None
    
    try:
        prompt = f"""
        Act as an elite senior career coach and technical mentor. 
        Create a precise, structured learning roadmap for a user transitioning into the role of: "{job_role}".
        
        User's Current Technical Skills: {', '.join(user_skills)}
        
        Return ONLY a JSON object with this exact structure (no markdown formatting, just raw JSON):
        {{
            "required_skills": ["List of 5-8 most critical skills for this exact role. DO NOT include skills that are completely irrelevant to {job_role}."],
            "missing_skills": ["List of skills the user lacks from the required list (difference between required and current)."],
            "learning_roadmap": {{
                "missing_skill_name": {{
                    "roadmap": ["Step 1: Specific Topic", "Step 2: Practical Project Idea", "Step 3: Advanced Concept"],
                    "websites": ["Link to Official Documentation or highly-regarded written course (e.g., freeCodeCamp, MDN)"],
                    "youtube": ["Link to a specific, high-quality YouTube tutorial or full course video. Format: 'URL - Title of Video'"]
                }}
            }}
        }}

        IMPORTANT RULES: 
        1. Ensure JSON is completely valid.
        2. The courses and links MUST BE PROPER, recognizable resources (e.g., official docs, freeCodeCamp, Traversy Media, Programming with Mosh, etc.). Focus on quality over generic searches.
        3. Do not invent fake URLs. If a specific video URL is unknown, provide a highly specific search query formatted like a proper course link: 'https://www.youtube.com/results?search_query=full+course+topic - Topic Full Course'
        """
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    
    except Exception as e:
        print(f"AI Generation Failed: {e}")
        return None

def generate_manual_roadmap(job_role: str, user_skills: List[str]):
    """Generates roadmap using hardcoded dictionaries (Fallback)."""
    job_role_lower = job_role.lower()
    user_skills_lower = [s.lower() for s in user_skills]
    
    required_skills = JOB_SKILLS.get(job_role_lower, [])
    # If role not found, default to generic dev skills
    if not required_skills:
        required_skills = ["git", "communication", "problem solving", "python"]

    missing_skills = [skill for skill in required_skills if skill not in user_skills_lower]
    
    learning_roadmap = {}
    for skill in missing_skills:
        if skill in SKILL_RESOURCES:
            learning_roadmap[skill] = SKILL_RESOURCES[skill]
        else:
            learning_roadmap[skill] = {
                "roadmap": ["Basics", "Intermediate Concepts", "Projects", "Interviews"],
                "websites": [f"https://www.google.com/search?q={skill}+tutorial"],
                "youtube": [f"https://www.youtube.com/results?search_query={skill}+tutorial"]
            }
            
    return {
        "required_skills": required_skills,
        "missing_skills": missing_skills,
        "learning_roadmap": learning_roadmap
    }

from ..models import User
from ..auth_utils import get_current_user
from fastapi import APIRouter, Depends

# ... (imports)

@router.post("/generate")
def generate_roadmap(data: RoadmapRequest, current_user: User = Depends(get_current_user)):
    print(f"Generating roadmap for: {data.job_role}")
    
    # 1. Try AI Generation
    ai_result = generate_ai_roadmap(data.job_role, data.technical_skills)
    
    if ai_result:
        print("Success: Generated using AI")
        return {
            "job_role": data.job_role,
            "current_skills": data.technical_skills,
            "required_skills": ai_result.get("required_skills", []),
            "missing_skills": ai_result.get("missing_skills", []),
            "learning_roadmap": ai_result.get("learning_roadmap", {})
        }
    
    # 2. Fallback to Manual Generation
    print("Fallback: Using manual data")
    manual_result = generate_manual_roadmap(data.job_role, data.technical_skills)
    
    return {
        "job_role": data.job_role,
        "current_skills": data.technical_skills,
        "required_skills": manual_result["required_skills"],
        "missing_skills": manual_result["missing_skills"],
        "learning_roadmap": manual_result["learning_roadmap"],
        "note": "Generated using standard database (AI unavailable)"
    }