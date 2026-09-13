"""
MediFlow AI - Mock Tool Definitions
Defines deterministic healthcare capacity & patient management tools.
"""

from typing import Dict, List, Any

# Mock Patient Database
PATIENT_DB = {
    "P-1024": {
        "id": "P-1024",
        "name": "Simulated Patient",
        "age": 64,
        "condition": "Acute respiratory distress",
        "urgency": "HIGH",
        "required_specialty": "Pulmonology",
        "admission_required": True,
        "vital_signs": {
            "spO2": "89%",
            "heart_rate": "112 bpm",
            "respiratory_rate": "28 bpm"
        }
    }
}

def get_patient_details(patient_id: str = "P-1024") -> Dict[str, Any]:
    """Retrieve patient medical requirements and urgency status."""
    return PATIENT_DB.get(patient_id, PATIENT_DB["P-1024"])

def get_hospital_capacity(hospitals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Retrieve capacity summary across network hospitals."""
    return [
        {
            "id": h["id"],
            "name": h["name"],
            "specialty": h["specialty"],
            "available_beds": h["available_beds"],
            "load_percentage": h["load_percentage"],
            "status": h["status"]
        }
        for h in hospitals
    ]

def get_available_beds(hospital: Dict[str, Any]) -> int:
    """Retrieve verified available beds count for a specific hospital."""
    return hospital.get("available_beds", 0)

def get_opd_queue(hospital: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieve OPD wait time and queue metrics."""
    return {
        "hospital_id": hospital["id"],
        "opd_wait_min": hospital.get("opd_wait_min", 0),
        "queue_length": int(hospital.get("load_percentage", 50) * 0.4)
    }

def search_alternative_hospitals(
    hospitals: List[Dict[str, Any]], 
    required_specialty: str, 
    min_beds: int = 1
) -> List[Dict[str, Any]]:
    """Search and filter network hospitals matching required specialty and minimum beds."""
    candidates = []
    for h in hospitals:
        has_specialty = required_specialty in h.get("specialty", [])
        has_beds = h.get("available_beds", 0) >= min_beds
        if has_specialty and has_beds and h.get("status") == "AVAILABLE":
            candidates.append(h)
    return candidates

def verify_recommendation(
    hospital: Dict[str, Any], 
    patient_requirements: Dict[str, Any]
) -> Dict[str, Any]:
    """Verify hospital capability against patient requirements."""
    req_spec = patient_requirements.get("required_specialty")
    beds = hospital.get("available_beds", 0)
    has_spec = req_spec in hospital.get("specialty", [])
    is_available = hospital.get("status") == "AVAILABLE" and beds > 0

    if not is_available:
        return {
            "valid": False,
            "reason": f"{hospital['name']} is currently FULL or UNAVAILABLE ({beds} beds available)."
        }
    if not has_spec:
        return {
            "valid": False,
            "reason": f"{hospital['name']} does not support required specialty: {req_spec}."
        }
    
    return {
        "valid": True,
        "reason": f"{hospital['name']} has {beds} beds in {req_spec} and is ready for admission."
    }
