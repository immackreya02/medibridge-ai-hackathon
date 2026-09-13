"""
MediFlow AI - Agent Orchestration Core
Manages agentic flow, state persistence, planning, verification, and failure adaptation.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Dict, List, Any, Optional
from services.mediflow_tools import (
    get_patient_details,
    get_hospital_capacity,
    get_available_beds,
    get_opd_queue,
    search_alternative_hospitals,
    verify_recommendation
)

def get_initial_hospitals() -> List[Dict[str, Any]]:
    return [
        {
            "id": "city_general",
            "name": "City General Hospital",
            "specialty": ["Pulmonology", "Emergency", "Cardiology"],
            "available_beds": 2,
            "load_percentage": 82,
            "opd_wait_min": 40,
            "distance_km": 4.2,
            "status": "AVAILABLE"
        },
        {
            "id": "metro_care",
            "name": "Metro Care Hospital",
            "specialty": ["Pulmonology", "Neurology", "ICU"],
            "available_beds": 3,
            "load_percentage": 72,
            "opd_wait_min": 25,
            "distance_km": 7.1,
            "status": "AVAILABLE"
        },
        {
            "id": "community_medical",
            "name": "Community Medical Centre",
            "specialty": ["General Medicine", "Pediatrics"],
            "available_beds": 8,
            "load_percentage": 60,
            "opd_wait_min": 20,
            "distance_km": 5.5,
            "status": "AVAILABLE"
        }
    ]

class MediFlowAgent:
    def __init__(self):
        self.reset()

    def reset(self):
        self.patient = get_patient_details("P-1024")
        self.hospitals = get_initial_hospitals()
        self.agent_status = "ONLINE" # ONLINE, PROCESSING, ADAPTING, COMPLETED
        self.current_step = "IDLE"
        self.recommendation: Optional[Dict[str, Any]] = None
        self.previous_recommendation: Optional[Dict[str, Any]] = None
        self.verification: Dict[str, Any] = {"status": "UNVERIFIED", "details": None}
        self.approval_status = "PENDING" # PENDING, APPROVED
        self.failure_occurred = False
        self.tool_logs: List[Dict[str, str]] = []
        self.current_plan: List[Dict[str, Any]] = self._get_initial_plan_structure()

    def _get_initial_plan_structure(self) -> List[Dict[str, Any]]:
        return [
            {"step": 1, "title": "Assess Patient Requirements", "status": "pending"},
            {"step": 2, "title": "Retrieve Network Capacity", "status": "pending"},
            {"step": 3, "title": "Evaluate & Rank Hospitals", "status": "pending"},
            {"step": 4, "title": "Select Target Hospital", "status": "pending"},
            {"step": 5, "title": "Verify Bed & Specialty Capability", "status": "pending"}
        ]

    def _get_adapted_plan_structure(self) -> List[Dict[str, Any]]:
        return [
            {"step": 1, "title": "Assess Patient Requirements", "status": "completed"},
            {"step": 2, "title": "Retrieve Network Capacity", "status": "completed"},
            {"step": 3, "title": "Evaluate & Rank Hospitals", "status": "completed"},
            {"step": 4, "title": "Select Target Hospital", "status": "failed"},
            {"step": 5, "title": "Verify Bed Capability", "status": "failed"},
            {"step": 6, "title": "Detect Verification Failure", "status": "active"},
            {"step": 7, "title": "Retrieve Updated Network State", "status": "active"},
            {"step": 8, "title": "Search & Re-evaluate Alternatives", "status": "active"},
            {"step": 9, "title": "Select Metro Care Hospital", "status": "active"},
            {"step": 10, "title": "Verify New Recommendation", "status": "completed"}
        ]

    def log_tool(self, tool_name: str, action: str, output: str, status: str = "success"):
        self.tool_logs.append({
            "tool": tool_name,
            "action": action,
            "output": output,
            "status": status
        })

    def run_decision(self) -> Dict[str, Any]:
        """Execute initial goal-directed agent workflow."""
        self.reset()
        self.agent_status = "PROCESSING"
        
        # Step 1: Goal & Retrieval
        self.log_tool(
            "get_patient_details",
            "Retrieve clinical requirements for P-1024",
            "Required Specialty: Pulmonology | Urgency: HIGH | Bed Required: YES"
        )
        
        # Step 2: Capacity check tools
        caps = get_hospital_capacity(self.hospitals)
        self.log_tool(
            "get_hospital_capacity",
            "Scan network hospital load and bed availability",
            f"Retrieved 3 hospital profiles: City General (2 beds), Metro Care (3 beds), Community Centre (8 beds)"
        )
        
        city_gen = next(h for h in self.hospitals if h["id"] == "city_general")
        opd = get_opd_queue(city_gen)
        self.log_tool(
            "get_opd_queue",
            "Query OPD congestion and wait times",
            f"City General OPD Wait: {opd['opd_wait_min']}m (82% load)"
        )

        # Step 3 & 4: Planning & Decision
        # Filter matching Pulmonology & nearest: City General is 4.2km vs Metro Care 7.1km
        selected = city_gen
        self.recommendation = selected
        self.log_tool(
            "evaluate_hospitals",
            "Rank hospitals by Specialty Match, Distance & Availability",
            f"Selected #1 Rank: {selected['name']} (Nearest 4.2km with matching Pulmonology unit)"
        )

        # Step 5: Verification
        ver = verify_recommendation(selected, self.patient)
        self.verification = {
            "status": "VERIFIED" if ver["valid"] else "FAILED",
            "details": ver["reason"]
        }
        self.log_tool(
            "verify_recommendation",
            f"Verify bed & specialty availability for {selected['name']}",
            f"Result: VERIFIED - {ver['reason']}"
        )

        # Update Plan statuses
        for p in self.current_plan:
            p["status"] = "completed"

        self.agent_status = "COMPLETED"
        self.current_step = "AWAITING_APPROVAL"
        return self.get_state()

    def trigger_failure_and_adapt(self) -> Dict[str, Any]:
        """Simulate primary hospital failure and trigger agentic adaptation."""
        # Mutate state: City General becomes full
        city_gen = next(h for h in self.hospitals if h["id"] == "city_general")
        city_gen["available_beds"] = 0
        city_gen["load_percentage"] = 100
        city_gen["status"] = "FULL / UNAVAILABLE"

        self.failure_occurred = True
        self.previous_recommendation = self.recommendation
        self.recommendation = None
        self.agent_status = "ADAPTING"
        self.approval_status = "PENDING"
        self.current_plan = self._get_adapted_plan_structure()

        # Step 1: Detect failure
        self.log_tool(
            "verify_recommendation",
            "Periodic verification check on City General Hospital",
            "FAILED: City General Hospital updated status to FULL (0 beds available, 100% capacity)",
            status="error"
        )
        
        self.log_tool(
            "agent_controller",
            "Invalidate previous recommendation",
            "⚠ Recommendation Invalidated: Primary target City General Hospital is no longer available.",
            status="warning"
        )

        # Step 2: Adaptation & Retrieval
        updated_caps = get_hospital_capacity(self.hospitals)
        self.log_tool(
            "get_hospital_capacity",
            "Retrieve updated network hospital capacity",
            "City General (0 beds - FULL), Metro Care (3 beds - AVAILABLE), Community Centre (8 beds - AVAILABLE)"
        )

        # Step 3: Search alternatives
        candidates = search_alternative_hospitals(self.hospitals, self.patient["required_specialty"], min_beds=1)
        self.log_tool(
            "search_alternative_hospitals",
            "Filter network hospitals by required specialty 'Pulmonology'",
            f"Found {len(candidates)} qualified candidate(s): {[c['name'] for c in candidates]}"
        )

        # Step 4: Re-evaluate and Select Metro Care
        metro_care = next(h for h in self.hospitals if h["id"] == "metro_care")
        self.recommendation = metro_care
        self.log_tool(
            "re_evaluate_and_select",
            "Re-rank available candidates for patient referral",
            f"Selected #1 Alternative: {metro_care['name']} (Pulmonology, 3 available beds, 7.1km, 25m OPD wait)"
        )

        # Step 5: Verify new recommendation
        ver = verify_recommendation(metro_care, self.patient)
        self.verification = {
            "status": "VERIFIED" if ver["valid"] else "FAILED",
            "details": ver["reason"]
        }
        self.log_tool(
            "verify_recommendation",
            f"Verify bed capability for alternative {metro_care['name']}",
            f"Result: VERIFIED - {ver['reason']}"
        )

        self.agent_status = "COMPLETED"
        self.current_step = "ADAPTED_AWAITING_APPROVAL"
        return self.get_state()

    def approve_referral(self) -> Dict[str, Any]:
        """Record hospital staff human-in-the-loop approval."""
        self.approval_status = "APPROVED"
        self.log_tool(
            "human_in_the_loop",
            "Hospital staff referral sign-off",
            "✓ Referral Approved by hospital staff. Admission order transmitted."
        )
        return self.get_state()

    def get_state(self) -> Dict[str, Any]:
        return {
            "patient": self.patient,
            "hospitals": self.hospitals,
            "agent_status": self.agent_status,
            "current_step": self.current_step,
            "recommendation": self.recommendation,
            "previous_recommendation": self.previous_recommendation,
            "verification": self.verification,
            "approval_status": self.approval_status,
            "failure_occurred": self.failure_occurred,
            "tool_logs": self.tool_logs,
            "current_plan": self.current_plan
        }

# Global singleton agent instance for demo session
agent_instance = MediFlowAgent()
