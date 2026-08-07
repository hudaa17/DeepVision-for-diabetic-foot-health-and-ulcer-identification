from typing import Dict, Any, List

RECOMMENDATIONS_DB: Dict[str, Dict[str, Any]] = {
    "normal": {
        "risk_level": "normal",
        "urgency": "low",
        "follow_up": "Annual screening recommended.",
        "actions": [
            "Inspect both feet daily for any redness, cuts, blisters, or dry skin.",
            "Wash feet daily in lukewarm water, dry them carefully, especially between toes.",
            "Apply moisturizer to feet but avoid applying it between the toes.",
            "Always wear socks and well-fitting, comfortable shoes. Do not walk barefoot.",
            "Maintain optimal glycemic control and manage overall diabetic factors."
        ]
    },
    "mild": {
        "risk_level": "mild",
        "urgency": "medium",
        "follow_up": "Schedule a routine podiatry consult within 2-4 weeks.",
        "actions": [
            "Perform rigorous daily foot self-inspections (use a mirror to check the soles).",
            "Seek professional evaluation for any corns, calluses, or ingrown toenails (do not perform 'bathroom surgery').",
            "Wear therapeutic socks and custom orthotics or supportive shoes to relieve pressure points.",
            "Keep dry cracks moisturized with specialized urea creams.",
            "Optimize blood glucose, blood pressure, and cholesterol management."
        ]
    },
    "severe": {
        "risk_level": "severe",
        "urgency": "high",
        "follow_up": "IMMEDIATE medical referral. Consult a wound care specialist/podiatrist within 24-48 hours.",
        "actions": [
            "Strictly avoid putting weight (offloading) on any foot areas with suspected ulcers or open wounds.",
            "Keep any active lesions clean, covered with sterile dressings, and dry.",
            "Do not apply over-the-counter creams or ointments to open wounds without prescription.",
            "Monitor body temperature and watch for systemic signs of infection (fever, chills, rapid heartbeat).",
            "Prepare for immediate diagnostic checks (vascular tests, X-rays, wound cultures) as guided by professionals."
        ]
    }
}

def get_recommendations_for_risk(risk_level: str) -> Dict[str, Any]:
    """Retrieve recommendations for a specific risk level."""
    cleaned_level = risk_level.lower().strip()
    return RECOMMENDATIONS_DB.get(cleaned_level, RECOMMENDATIONS_DB["normal"])
