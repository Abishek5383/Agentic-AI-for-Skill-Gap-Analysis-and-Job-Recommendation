from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import PyPDF2
import os
import json
from pydantic import BaseModel
from typing import List, Optional

from ..models import User
from ..auth_utils import get_current_user
from ..utils.keyword_extractor import KeywordExtractor

router = APIRouter(prefix="/resume", tags=["Resume"])

def extract_text_from_pdf(file_file):
    try:
        reader = PyPDF2.PdfReader(file_file)
        text = " ".join(page.extract_text() for page in reader.pages)
        return text
    except Exception as e:
        print(f"PDF Error: {e}")
        return ""

@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # 1. Extract Text
    text = extract_text_from_pdf(file.file)
    if not text:
        raise HTTPException(status_code=400, detail="Could not read PDF file")
    
    # 2. AI Analysis (Primary)
    try:
        from ..services.ai_resume import AIResumeParser
        print("DEBUG: Attempting AI Resume Parsing...")
        data = AIResumeParser.parse_resume(text)
        print("DEBUG: AI Parsing Successful")
        return data
    except Exception as e:
        print(f"WARNING: AI Parsing Failed ({e}). Falling back to Keyword Extraction.")
        
        # 3. Keyword Analysis (Fallback)
        try:
            data = KeywordExtractor.process_resume(text)
            return data
        except Exception as e:
            print(f"Keyword Extraction Failed: {e}")
            return {
                "name": "Candidate",
                "email": "Not Found",
                "technical_skills": [],
                "soft_skills": [],
                "projects": ["Error parsing resume"],
                "experience": "NIL",
                "job_role": "Backend Developer"
            }