import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
# We will import models inside the init function or at top level if they don't import database
# Models are defined in models.py.
# To avoid circular imports, models.py should NOT import from database.py anymore.

async def init_db():
    # Import models here to avoid circular imports if models import anything from here (they shouldn't now)
    from .models import Profile, JobApplication, User
    
    mongo_url = os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    await init_beanie(database=client.career_agent, document_models=[Profile, JobApplication, User])