"""
MediFlow AI - FastAPI Router
Endpoints for running agent decisions, failure simulation, referral approval, and state management.
"""

# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from services.mediflow_agent import agent_instance

router = APIRouter()

@router.get("/state")
async def get_state():
    """Retrieve current MediFlow agent state, patient data, hospitals, and logs."""
    return agent_instance.get_state()

@router.post("/run")
async def run_decision():
    """Execute initial MediFlow agentic evaluation flow."""
    return agent_instance.run_decision()

@router.post("/failure")
async def simulate_failure():
    """Trigger primary hospital failure simulation and activate agent adaptation."""
    return agent_instance.trigger_failure_and_adapt()

@router.post("/approve")
async def approve_referral():
    """Hospital staff sign-off / approval for current referral recommendation."""
    return agent_instance.approve_referral()

@router.post("/reset")
async def reset_demo():
    """Reset MediFlow agent state to initial baseline for clean demo runs."""
    agent_instance.reset()
    return agent_instance.get_state()
