from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class ReviewerFeedback(BaseModel):
    reviewer_email: EmailStr = Field(alias="reviewerEmail")
    reviewer_name: str = Field(alias="reviewerName")
    score: int
    comments: str
    decision: str  # approve, reject, revise
    reviewed_at: datetime = Field(default_factory=datetime.utcnow, alias="reviewedAt")
    
    class Config:
        allow_population_by_field_name = True

class SignOffApproval(BaseModel):
    role: str
    name: str
    status: str  # pending, approved, rejected
    date: Optional[str] = None
    notes: Optional[str] = None

class Application(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    grant_call_id: str = Field(alias="grantCallId")
    title: str
    email: EmailStr
    researcher_name: str = Field(alias="researcherName")
    institution: str
    department: str
    project_summary: str = Field(alias="projectSummary")
    objectives: str
    methodology: str
    expected_outcomes: str = Field(alias="expectedOutcomes")
    budget_amount: float = Field(alias="budgetAmount")
    budget_justification: str = Field(alias="budgetJustification")
    timeline: str
    biodata: Optional[str] = None
    deadline: Optional[str] = None
    status: str = "submitted"  # submitted, under_review, approved, rejected, revision_requested, pending_sign_off, contract_stage, awarded, completed
    reviewer_feedback: List[ReviewerFeedback] = Field(default=[], alias="reviewerFeedback")
    final_decision: Optional[str] = Field(None, alias="finalDecision")
    decision_notes: Optional[str] = Field(None, alias="decisionNotes")
    is_editable: bool = Field(True, alias="isEditable")
    assigned_reviewers: List[str] = Field(default=[], alias="assignedReviewers")
    sign_off_approvals: List[SignOffApproval] = Field(default=[], alias="signOffApprovals")
    award_amount: Optional[float] = Field(None, alias="awardAmount")
    contract_file_name: Optional[str] = Field(None, alias="contractFileName")
    award_letter_generated: bool = Field(False, alias="awardLetterGenerated")
    revision_count: int = Field(0, alias="revisionCount")
    original_submission_date: datetime = Field(default_factory=datetime.utcnow, alias="originalSubmissionDate")
    proposal_file_name: Optional[str] = Field(None, alias="proposalFileName")
    submitted_at: datetime = Field(default_factory=datetime.utcnow, alias="submittedAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}