from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Any
from datetime import datetime
from ..models import JobApplication, Profile, User
from ..services.email_service import send_job_application_email
from ..auth_utils import get_current_user
from beanie import PydanticObjectId

router = APIRouter(prefix="/apply", tags=["Applications"])

class ApplyRequest(BaseModel):
    job_ids: List[Any] # Accept any ID type (int/str)

class EmailApplyRequest(BaseModel):
    job_id: Any
    company_email: str
    job_title: str
    company_name: str

@router.post("/")
async def apply_to_jobs(data: ApplyRequest, current_user: User = Depends(get_current_user)):
    # Find profile for user
    profile = await Profile.find_one(Profile.user_id == current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="User profile not found. Please create a profile first.")

    applied_jobs = []
    
    for job_id in data.job_ids:
        # Check if already applied
        existing = await JobApplication.find_one(
            JobApplication.user_id == current_user.id,
            JobApplication.job_id == job_id
        )
        
        if not existing:
            application = JobApplication(
                user_id=current_user.id,
                profile_id=profile.id,
                job_id=job_id,
                status="Applied"
            )
            await application.insert()
            applied_jobs.append(job_id)
    
    return {
        "message": "Applications submitted successfully",
        "applied_count": len(applied_jobs),
        "job_ids": applied_jobs
    }

@router.post("/email")
async def apply_via_email(data: EmailApplyRequest, current_user: User = Depends(get_current_user)):
    """Apply to job via email"""
    
    # Get user profile
    profile = await Profile.find_one(Profile.user_id == current_user.id)
    
    if not profile:
        return {"success": False, "message": "Profile not found"}
    
    # Send email
    result = send_job_application_email(
        company_email=data.company_email,
        job_title=data.job_title,
        company_name=data.company_name,
        applicant_name=profile.name,
        applicant_email=profile.email if profile.email else current_user.email,
        applicant_skills=profile.skills
    )
    
    # Save application record
    if result["success"]:
        application = JobApplication(
            user_id=current_user.id,
            profile_id=profile.id,
            job_id=data.job_id,
            status="Email Sent"
        )
        await application.insert()
    
    return result

@router.get("/status")
async def get_application_status(current_user: User = Depends(get_current_user)):
    applications = await JobApplication.find(
        JobApplication.user_id == current_user.id
    ).to_list()
    
    return {
        "user_id": str(current_user.id),
        "total_applications": len(applications),
        "applications": [
            {
                "job_id": app.job_id,
                "status": app.status,
                "applied_at": app.applied_at
            }
            for app in applications
        ]
    }