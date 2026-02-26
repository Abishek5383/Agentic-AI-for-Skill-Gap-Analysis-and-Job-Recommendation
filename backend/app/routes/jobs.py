from fastapi import APIRouter, HTTPException
from typing import Optional
import requests
import os
from dotenv import load_dotenv
from ..models import Profile
from beanie import PydanticObjectId

load_dotenv()

router = APIRouter(prefix="/jobs", tags=["Jobs"])

ADZUNA_APP_ID = "679d6946"
ADZUNA_API_KEY = "34a6b99b5aa3f77e94d96629aacbdbef"

def fetch_adzuna_jobs(query: str, location: str = "in", results_per_page: int = 20):
    url = f"https://api.adzuna.com/v1/api/jobs/{location}/search/1"
    
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_API_KEY,
        "results_per_page": results_per_page,
        "what": query,
        "content-type": "application/json"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        jobs = []
        for idx, job in enumerate(data.get("results", []), 1):
            description = job.get("description", "")
            
            jobs.append({
                "id": job.get("id", f"adzuna_{idx}"),
                "title": job.get("title"),
                "company": job.get("company", {}).get("display_name", "Company Name"),
                "location": job.get("location", {}).get("display_name", "Remote"),
                "salary_min": job.get("salary_min"),
                "salary_max": job.get("salary_max"),
                "description": description[:500] if description else "No description",
                "apply_link": job.get("redirect_url"),
                "posted_date": job.get("created"),
                "contract_type": job.get("contract_type"),
                "category": job.get("category", {}).get("label", "General"),
            })
        
        return jobs
    except Exception as e:
        print(f"Error fetching Adzuna jobs: {e}")
        return []

from ..models import User
from ..auth_utils import get_current_user
from fastapi import APIRouter, HTTPException, Depends

# ...

@router.get("/matched/{profile_id}")
async def get_matched_jobs(profile_id: str, current_user: User = Depends(get_current_user)):
    try:
        # Check if profile_id is a valid ObjectId structure if needed, or let Beanie handle it
        profile = await Profile.get(PydanticObjectId(profile_id))
    except Exception:
        # If ID format is invalid
        raise HTTPException(status_code=400, detail="Invalid Profile ID format")
    
    if not profile:
        return {"error": "Profile not found"}
    
    job_role = getattr(profile, 'job_role', 'developer')
    primary_skills = profile.technical_skills[:2] if len(profile.technical_skills) > 0 else []
    
    search_query = f"{job_role} {' '.join(primary_skills)}"
    
    # This part remains synchronous as it uses 'requests'. 
    # In a fully async app, we should use 'httpx', but for now keeping it simple is fine.
    # We can run it in a threadpool if it blocks too much, but for low traffic it's ok.
    real_jobs = fetch_adzuna_jobs(search_query, location="in")
    
    if not real_jobs:
        return []
    
    user_skills = [skill.lower() for skill in profile.technical_skills]
    
    matched_jobs = []
    for job in real_jobs:
        job_text = (
            str(job.get("title", "")) + " " + 
            str(job.get("description", "")) + " " + 
            str(job.get("category", ""))
        ).lower()
        
        matching_skills = []
        
        for skill in user_skills:
            if skill in job_text:
                matching_skills.append(skill)
        
        total_user_skills = len(user_skills)
        match_count = len(matching_skills)
        match_percentage = int((match_count / total_user_skills) * 100) if total_user_skills > 0 else 0
        
        # Calculate missing skills (skills in user profile that were NOT found in job)
        # Note: This is "skills the user has that aren't relevant". 
        # Actually, usually "missing skills" means "skills the JOB matches but user doesn't have".
        # But here we are searching *user skills* in *job text*.
        # So `matching_skills` = Intersection.
        # So we can only really show the intersection.
        # But wait, looking at it from a "Match" perspective:
        # We want to show which of the USER'S skills matched.
        
        salary_display = "Not specified"
        s_min = job.get("salary_min")
        s_max = job.get("salary_max")
        
        if s_min and s_max:
            salary_display = f"${s_min:,.0f} - ${s_max:,.0f}"
        elif s_min:
            salary_display = f"${s_min:,.0f}+"
        
        matched_jobs.append({
            **job,
            "salary": salary_display,
            "match_percentage": match_percentage,
            "matching_skills": matching_skills,
            "missing_skills": list(set(user_skills) - set(matching_skills)) # Skills user has but job didn't mention
        })
    
    matched_jobs.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    return matched_jobs