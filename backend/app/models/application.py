from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class ReviewerFeedback(BaseModel):
    reviewer_email: EmailStr
    reviewer_name: str
    score: int
    comments: str
    decision: str  # approve, reject, revise
    reviewed_at: datetime = Field(default_factory=datetime.utcnow)

class Application(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    grant_call_id: str
    title: str
    email: EmailStr
    researcher_name: str
    institution: str
    department: str
    project_summary: str
    objectives: str
    methodology: str
    expected_outcomes: str
    budget_amount: float
    budget_justification: str
    timeline: str
    status: str = "submitted"  # submitted, under_review, approved, rejected, revision_requested
    reviewer_feedback: List[ReviewerFeedback] = []
    final_decision: Optional[str] = None
    decision_notes: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}