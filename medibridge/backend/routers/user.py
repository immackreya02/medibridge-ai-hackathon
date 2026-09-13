
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    preferred_language: Optional[str] = "en"

@router.get("/stats")
async def get_stats():
    return {"total_chats": 0, "total_reports": 0, "risk_alerts": 0, "saved_summaries": 0}

@router.put("/profile")
async def update_profile(profile: ProfileUpdate):
    return {"status": "updated", "profile": profile.dict()}
