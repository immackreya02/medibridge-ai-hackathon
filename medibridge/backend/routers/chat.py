
# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
# pyrefly: ignore [missing-import]
import httpx
import os
import json

router = APIRouter()
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

SYSTEM_PROMPT = """You are MediBridge AI, a multilingual healthcare assistant.
- Understand symptoms in English, Hindi, Tamil, Marathi, Telugu
- Assess urgency: low / moderate / high / emergency  
- Provide calm, clear guidance
- NEVER diagnose; always recommend consulting a doctor
- Detect emergency situations (chest pain + breathlessness = emergency)
End with JSON: {"risk":"low|moderate|high|emergency","symptoms":[],"nextSteps":[]}"""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []
    language: str = "en"

class ChatSession(BaseModel):
    user_id: str
    language: str = "en"

def evaluate_symptoms_fallback(message: str, lang: str = "en") -> dict:
    msg_lower = message.lower()
    
    # Emergency detection
    if any(k in msg_lower for k in ["chest pain", "shortness of breath", "breathless", "severe bleeding", "unconscious", "heart attack", "छाती में दर्द", "सांस फूलना"]):
        return {
            "content": "⚠️ **URGENT MEDICAL WARNING**: Your symptoms indicate a potential high-risk cardiovascular or respiratory emergency. Please seek immediate emergency medical care or visit the nearest hospital emergency department right away.",
            "risk": "emergency",
            "symptoms": ["Chest pain / Breathlessness"],
            "nextSteps": [
                "Call Emergency Services (112 / 102) immediately",
                "Do not drive yourself to the hospital",
                "Rest in a comfortable position while awaiting medical transport"
            ]
        }
    
    # High risk detection
    if any(k in msg_lower for k in ["high fever", "stiff neck", "severe abdominal pain", "blood in stool", "coughing blood", "तेज बुखार"]):
        return {
            "content": "Your reported symptoms require urgent clinical evaluation by a physician within the next 2-4 hours. While not an immediate life-threatening emergency, prompt medical attention is strongly advised.",
            "risk": "high",
            "symptoms": ["Severe pain / Persistent high fever"],
            "nextSteps": [
                "Schedule an urgent doctor consultation or visit an Urgent Care clinic",
                "Monitor vital signs (temperature, oxygen saturation)",
                "Stay hydrated and rest"
            ]
        }

    # Moderate risk detection
    if any(k in msg_lower for k in ["fever", "headache", "vomiting", "diarrhea", "cough", "body ache", "बुखार", "सिरदर्द"]):
        return {
            "content": "Thank you for sharing your symptoms. Based on your description, this appears to be a moderate health concern. You should monitor your symptoms closely and consult a healthcare professional for proper evaluation.",
            "risk": "moderate",
            "symptoms": ["Fever / Moderate discomfort"],
            "nextSteps": [
                "Book a general practitioner consultation",
                "Maintain adequate fluid intake and rest",
                "Track symptom duration and severity changes"
            ]
        }

    # Default Low risk guidance
    return {
        "content": "Thank you for reaching out to MediBridge AI. Your query has been received. Please remember that while AI provides helpful health information, it cannot replace a licensed medical practitioner's diagnosis.",
        "risk": "low",
        "symptoms": ["General Inquiry"],
        "nextSteps": [
            "Consult a physician if symptoms worsen or persist",
            "Maintain wellness guidelines and balanced hydration"
        ]
    }

@router.post("/message")
async def send_message(req: ChatRequest):
    if not GEMINI_KEY:
        return evaluate_symptoms_fallback(req.message, req.language)
        
    try:
        contents = []
        for m in (req.history or [])[-6:]:
            contents.append({"role": "user" if m.role == "user" else "model", "parts": [{"text": m.content}]})
        contents.append({"role": "user", "parts": [{"text": req.message}]})
        
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.post(
                f"{GEMINI_URL}?key={GEMINI_KEY}",
                json={"contents": contents, "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]}}
            )
        data = res.json()
        if "candidates" in data and data["candidates"]:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            meta = {}
            if "```json" in text:
                try:
                    raw = text.split("```json")[1].split("```")[0]
                    meta = json.loads(raw)
                    text = text.split("```json")[0].strip()
                except: pass
            return {"content": text, "risk": meta.get("risk", "low"), "symptoms": meta.get("symptoms", []), "nextSteps": meta.get("nextSteps", [])}
        else:
            return evaluate_symptoms_fallback(req.message, req.language)
    except Exception as e:
        return evaluate_symptoms_fallback(req.message, req.language)

@router.post("/session")
async def create_session(session: ChatSession):
    return {"session_id": f"sess_{session.user_id}_{int(__import__('time').time())}", "status": "created"}

@router.get("/history/{session_id}")
async def get_history(session_id: str):
    return {"session_id": session_id, "messages": []}
