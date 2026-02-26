from fastapi import APIRouter, Depends
from ..models import Profile, User
from ..auth_utils import get_current_user
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/profile", tags=["Profile"])

class ProfileRequest(BaseModel):
    name: str
    email: Optional[str] = None
    technical_skills: List[str]
    soft_skills: List[str]
    projects: str
    experience: str
    job_role: str
    missing_skills: List[str] = []
    roadmap: Optional[Dict[str, Any]] = None

@router.post("/save")
async def save_profile(data: ProfileRequest, current_user: User = Depends(get_current_user)):
    # Check if profile exists for user
    existing_profile = await Profile.find_one(Profile.user_id == current_user.id)
    
    if existing_profile:
        # Update existing
        existing_profile.name = data.name
        existing_profile.email = data.email
        existing_profile.technical_skills = data.technical_skills
        existing_profile.soft_skills = data.soft_skills
        existing_profile.projects = data.projects
        existing_profile.experience = data.experience
        existing_profile.job_role = data.job_role
        existing_profile.missing_skills = data.missing_skills
        existing_profile.roadmap = data.roadmap
        await existing_profile.save()
        return {"profile_id": str(existing_profile.id), "message": "Profile updated"}
    else:
        # Create new
        profile = Profile(
            user_id=current_user.id,
            **data.dict()
        )
        await profile.insert()
        return {"profile_id": str(profile.id), "message": "Profile created"}

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    profile = await Profile.find_one(Profile.user_id == current_user.id)
    if not profile:
        return {"error": "Profile not found"}
    return profile
