from pydantic import BaseModel, EmailStr
from typing import Optional, List

class ReviewerFeedbackCreate(BaseModel):
    reviewer_email: EmailStr
    reviewer_name: str
    score: int
    comments: str
    decision: str

class ApplicationCreate(BaseModel):
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

class ApplicationUpdate(BaseModel):
    title: Optional[str] = None
    project_summary: Optional[str] = None
    objectives: Optional[str] = None
    methodology: Optional[str] = None
    expected_outcomes: Optional[str] = None
    budget_amount: Optional[float] = None
    budget_justification: Optional[str] = None
    timeline: Optional[str] = None
    status: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
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
    status: str
    submitted_at: str
    updated_at: str