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
    },
    "grade 1": {
        "risk_level": "Grade 1 (Superficial Ulcer / Pre-ulcerative lesion)",
        "urgency": "medium",
        "follow_up": "Schedule podiatric review within 1-2 weeks.",
        "actions": [
            "Inspect the lesion daily; protect the site from friction and mechanical trauma.",
            "Wear therapeutic diabetic footwear or offloading insoles to minimize plantar pressure.",
            "Cleanse gently with normal saline and cover with sterile, non-adherent protective dressings.",
            "Do not apply unprescribed chemicals or aggressive antiseptic solutions.",
            "Maintain tight blood glucose control to support tissue healing."
        ]
    },
    "grade 2": {
        "risk_level": "Grade 2 (Deep Ulcer to Tendon/Capsule)",
        "urgency": "high",
        "follow_up": "Consult a diabetic foot wound specialist within 48-72 hours.",
        "actions": [
            "Initiate strict mechanical offloading (removable cast walker or specialized boot).",
            "Keep the wound covered with an appropriate exudate-absorbing dressing.",
            "Inspect wound margins for expanding erythema, warmth, or purulent drainage.",
            "Prepare for clinical probe-to-bone test and sharp debridement by trained clinicians.",
            "Optimize glycemic, nutritional, and hydration parameters."
        ]
    },
    "grade 3": {
        "risk_level": "Grade 3 (Deep Ulcer with Abscess / Osteitis)",
        "urgency": "urgent",
        "follow_up": "URGENT specialist evaluation required within 24 hours.",
        "actions": [
            "Strict non-weight-bearing (complete offloading) on the affected extremity.",
            "Monitor for systemic signs of infection (fever, chills, tachycardia, confusion).",
            "Obtain plain radiographs or advanced imaging (MRI) to assess osteomyelitis involvement.",
            "Initiate empirical or culture-directed antibiotic regimens as prescribed by physician.",
            "Urgent surgical consultation for potential incision, drainage, or debridement."
        ]
    },
    "grade 4": {
        "risk_level": "Grade 4 (Gangrene / Advanced Tissue Necrosis)",
        "urgency": "emergency",
        "follow_up": "IMMEDIATE EMERGENCY hospital admission and vascular surgery referral.",
        "actions": [
            "Emergency medical evaluation to prevent systemic sepsis and limb loss.",
            "Comprehensive lower-extremity arterial vascular assessment (Doppler/angiography).",
            "Strict bed rest; protect necrotic tissue from maceration and secondary bacterial infection.",
            "Initiate intravenous broad-spectrum antimicrobial therapy under specialist guidance.",
            "Emergency multidisciplinary surgical evaluation for revascularization and limb salvage."
        ]
    },
    "healthy foot": {
        "risk_level": "Healthy Foot (Wagner Grade 0 / Intact Dermis)",
        "urgency": "low",
        "follow_up": "Routine annual podiatric diabetic foot evaluation and ongoing daily self-monitoring.",
        "actions": [
            "Perform daily visual foot inspections (soles, heels, and between toes) using a mirror to detect any pressure areas or early friction.",
            "Apply daily hydrating emollient (urea 10-20% cream) to plantar surfaces and heels to prevent fissures; avoid applying between toes.",
            "Wear seamless, moisture-wicking diabetic socks and well-cushioned, properly fitted therapeutic footwear.",
            "Never walk barefoot (even indoors) to safeguard against accidental micro-trauma or puncture wounds.",
            "Maintain tight glycemic management (HbA1c target < 7.0%) to preserve peripheral nerve function and vascular perfusion."
        ]
    },
    "healthy / low risk": {
        "risk_level": "Healthy Foot (Wagner Grade 0 / Intact Dermis)",
        "urgency": "low",
        "follow_up": "Routine annual podiatric diabetic foot evaluation and ongoing daily self-monitoring.",
        "actions": [
            "Perform daily visual foot inspections (soles, heels, and between toes) using a mirror to detect any pressure areas or early friction.",
            "Apply daily hydrating emollient (urea 10-20% cream) to plantar surfaces and heels to prevent fissures; avoid applying between toes.",
            "Wear seamless, moisture-wicking diabetic socks and well-cushioned, properly fitted therapeutic footwear.",
            "Never walk barefoot (even indoors) to safeguard against accidental micro-trauma or puncture wounds.",
            "Maintain tight glycemic management (HbA1c target < 7.0%) to preserve peripheral nerve function and vascular perfusion."
        ]
    },
    "healthy": {
        "risk_level": "Healthy Foot (Wagner Grade 0 / Intact Dermis)",
        "urgency": "low",
        "follow_up": "Routine annual podiatric diabetic foot evaluation and ongoing daily self-monitoring.",
        "actions": [
            "Perform daily visual foot inspections (soles, heels, and between toes) using a mirror to detect any pressure areas or early friction.",
            "Apply daily hydrating emollient (urea 10-20% cream) to plantar surfaces and heels to prevent fissures; avoid applying between toes.",
            "Wear seamless, moisture-wicking diabetic socks and well-cushioned, properly fitted therapeutic footwear.",
            "Never walk barefoot (even indoors) to safeguard against accidental micro-trauma or puncture wounds.",
            "Maintain tight glycemic management (HbA1c target < 7.0%) to preserve peripheral nerve function and vascular perfusion."
        ]
    }
}

def get_recommendations_for_risk(risk_level: str) -> Dict[str, Any]:
    """Retrieve recommendations for a specific risk level."""
    cleaned_level = risk_level.lower().strip()
    return RECOMMENDATIONS_DB.get(cleaned_level, RECOMMENDATIONS_DB["normal"])
