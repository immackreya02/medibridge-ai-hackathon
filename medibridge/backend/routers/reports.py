
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import httpx, os, base64, json

router = APIRouter()
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

REPORT_PROMPT = """Analyze this medical report and respond ONLY in JSON:
{
  "title": "Report Type",
  "summary": "2-sentence summary",
  "findings": [{"label":"name","value":"val","status":"normal|abnormal|borderline","explanation":"simple explanation"}],
  "keyPoints": ["point"],
  "discussWithDoctor": ["topic"],
  "urgency": "routine|soon|urgent"
}"""

@router.post("/analyze")
async def analyze_report(file: UploadFile = File(...), user_id: Optional[str] = Form(None)):
    content = await file.read()
    b64 = base64.b64encode(content).decode()
    mime = file.content_type or "image/jpeg"
    
    try:
        parts = [
            {"inline_data": {"mime_type": mime, "data": b64}},
            {"text": "Analyze this medical report and provide a simplified explanation."}
        ]
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                f"{GEMINI_URL}?key={GEMINI_KEY}",
                json={"contents": [{"role": "user", "parts": parts}],
                      "systemInstruction": {"parts": [{"text": REPORT_PROMPT}]}}
            )
        data = res.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        clean = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_reports():
    return {"reports": []}
