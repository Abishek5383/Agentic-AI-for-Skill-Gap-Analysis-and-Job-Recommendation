from typing import List, Optional, Dict, Any
from beanie import Document, PydanticObjectId 
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class User(Document):
    email: EmailStr
    password_hash: str
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = ["email"]

class Profile(Document):
    user_id: Optional[PydanticObjectId] = None
    name: str
    email: Optional[str] = None
    technical_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    projects: Optional[str] = None
    experience: Optional[str] = None
    job_role: Optional[str] = "developer"
    missing_skills: List[str] = []
    roadmap: Optional[Dict[str, Any]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "profiles"

class JobApplication(Document):
    user_id: Optional[PydanticObjectId] = None
    profile_id: Optional[PydanticObjectId] = None
    job_id: Any # Adzuna IDs can be strings or ints
    status: str = "Applied"
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "job_applications"