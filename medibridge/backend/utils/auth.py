
import os
from firebase_admin import auth, credentials, initialize_app
from fastapi import HTTPException, Header
from typing import Optional

# Initialize Firebase Admin (do once)
try:
    import firebase_admin
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if cred_path:
            cred = credentials.Certificate(cred_path)
            initialize_app(cred)
except Exception:
    pass

async def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
