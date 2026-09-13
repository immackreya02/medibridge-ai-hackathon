
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx, os, json

router = APIRouter()
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

PROMPT = """Generate a doctor consultation prep summary. Respond ONLY in JSON:
{
  "consultationSummary": "overview",
  "symptomTimeline": [{"date":"Day X","symptom":"desc","severity":"mild|moderate|severe"}],
  "importantNotes": ["note"],
  "questionsForDoctor": ["Question?"],
  "medicationsToMention": ["med"],
  "redFlags": ["warning"]
}"""

class Symptom(BaseModel):
    text: str
    duration: Optional[str] = ""
    severity: str = "moderate"

class DoctorPrepRequest(BaseModel):
    symptoms: List[Symptom]
    additional_info: Optional[str] = ""
    user_id: Optional[str] = None

@router.post("/generate")
async def generate_prep(req: DoctorPrepRequest):
    symptom_text = "; ".join([f"{s.text} ({s.duration or 'unknown'}, {s.severity})" for s in req.symptoms if s.text])
    prompt = f"Symptoms: {symptom_text}. Additional: {req.additional_info or 'None'}"
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                f"{GEMINI_URL}?key={GEMINI_KEY}",
                json={"contents": [{"role": "user", "parts": [{"text": prompt}]}],
                      "systemInstruction": {"parts": [{"text": PROMPT}]}}
            )
        data = res.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        clean = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_preps():
    return {"preps": []}
