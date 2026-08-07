from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.prediction import PredictionResponse

class RiskDistribution(BaseModel):
    normal: int
    mild: int
    severe: int

class MonthlyTrendItem(BaseModel):
    month: str
    count: int

class DashboardStats(BaseModel):
    total_patients: int
    total_predictions: int
    risk_distribution: RiskDistribution
    monthly_trends: List[MonthlyTrendItem]
    recent_predictions: List[PredictionResponse]

class PatientDashboardResponse(BaseModel):
    patient_id: str
    prediction_history: List[PredictionResponse]
    current_risk_level: Optional[str] = None
    latest_recommendations: Optional[Dict[str, Any]] = None
