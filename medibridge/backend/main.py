# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
import uvicorn

from routers import chat, reports, doctor_prep, user, mediflow

app = FastAPI(
    title="MediBridge AI API",
    description="Multilingual Healthcare Assistant Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://medibridge-ai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(doctor_prep.router, prefix="/api/doctor-prep", tags=["Doctor Prep"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(mediflow.router, prefix="/api/mediflow", tags=["MediFlow AI"])

@app.get("/")
async def root():
    return {"message": "MediBridge AI API", "status": "online", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
