from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class Milestone(BaseModel):
    id: str
    title: str
    due_date: str
    status: str  # pending, in_progress, completed, on_hold
    description: str
    progress_report_uploaded: Optional[bool] = False
    progress_report_date: Optional[str] = None
    progress_report_filename: Optional[str] = None
    is_overdue: Optional[bool] = False

class Requisition(BaseModel):
    id: str
    milestone_id: str
    amount: float
    requested_date: str
    status: str  # submitted, approved, rejected
    notes: str
    reviewed_by: Optional[str] = None
    reviewed_date: Optional[str] = None
    review_notes: Optional[str] = None

class Partner(BaseModel):
    id: str
    name: str
    role: str
    mou_filename: Optional[str] = None
    uploaded_date: Optional[str] = None

class FinalReport(BaseModel):
    narrative_report: Optional[Dict[str, str]] = None  # filename, uploaded_date
    financial_report: Optional[Dict[str, str]] = None  # filename, uploaded_date
    status: str = "draft"  # draft, submitted, under_review, approved, revision_required
    submitted_date: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_date: Optional[str] = None
    review_notes: Optional[str] = None

class ClosureWorkflow(BaseModel):
    status: str = "pending"  # pending, vc_review, signed_off, closed
    vc_sign_off_token: Optional[str] = None
    vc_signed_by: Optional[str] = None
    vc_signed_date: Optional[str] = None
    vc_notes: Optional[str] = None
    closure_certificate_generated: Optional[bool] = False
    closure_certificate_date: Optional[str] = None

class Project(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    application_id: str
    title: str
    status: str = "active"  # active, completed, on_hold, cancelled, closed
    start_date: str
    end_date: str
    milestones: List[Milestone] = []
    requisitions: List[Requisition] = []
    partners: List[Partner] = []
    final_report: Optional[FinalReport] = None
    closure_workflow: Optional[ClosureWorkflow] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}