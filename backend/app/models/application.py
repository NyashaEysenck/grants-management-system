from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class ReviewerFeedback(BaseModel):
    id: str
    application_id: str = Field(alias="applicationId")
    reviewer_email: EmailStr = Field(alias="reviewerEmail")
    reviewer_name: Optional[str] = Field(None, alias="reviewerName")
    comments: str
    decision: str  # approve, reject, request_changes
    annotated_file_name: Optional[str] = Field(None, alias="annotatedFileName")
    submitted_at: datetime = Field(default_factory=datetime.utcnow, alias="submittedAt")
    review_token: str = Field(alias="reviewToken")
    
    class Config:
        allow_population_by_field_name = True

class SignOffApproval(BaseModel):
    id: str
    application_id: str = Field(alias="applicationId")
    role: str  # DORI, DVC, VC
    approver_email: EmailStr = Field(alias="approverEmail")
    approver_name: Optional[str] = Field(None, alias="approverName")
    status: str  # pending, approved, rejected
    comments: Optional[str] = None
    approved_at: Optional[str] = Field(None, alias="approvedAt")
    sign_off_token: str = Field(alias="signOffToken")

class Application(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    grant_id: str = Field(alias="grantId")  # Match frontend field name
    applicant_name: str = Field(alias="applicantName")  # Match frontend field name
    email: EmailStr
    proposal_title: str = Field(alias="proposalTitle")  # Match frontend field name
    institution: str
    department: str
    project_summary: str = Field(alias="projectSummary")
    objectives: str
    methodology: str
    expected_outcomes: str = Field(alias="expectedOutcomes")
    budget_amount: float = Field(alias="budgetAmount")
    budget_justification: str = Field(alias="budgetJustification")
    timeline: str
    biodata: Optional[Dict[str, Any]] = None  # Match frontend ResearcherBiodata interface
    deadline: Optional[str] = None
    status: str = "submitted"  # submitted, under_review, approved, rejected, withdrawn, editable, awaiting_signoff, signoff_complete, contract_pending, contract_received, needs_revision
    submission_date: str = Field(alias="submissionDate")  # Match frontend field name
    review_comments: str = Field(default="", alias="reviewComments")  # Match frontend field name
    reviewer_feedback: List[ReviewerFeedback] = Field(default=[], alias="reviewerFeedback")
    final_decision: Optional[str] = Field(None, alias="finalDecision")
    decision_notes: Optional[str] = Field(None, alias="decisionNotes")
    is_editable: Optional[bool] = Field(None, alias="isEditable")
    assigned_reviewers: Optional[List[str]] = Field(None, alias="assignedReviewers")
    sign_off_approvals: Optional[List[SignOffApproval]] = Field(None, alias="signOffApprovals")
    award_amount: Optional[float] = Field(None, alias="awardAmount")
    contract_file_name: Optional[str] = Field(None, alias="contractFileName")
    award_letter_generated: Optional[bool] = Field(None, alias="awardLetterGenerated")
    revision_count: Optional[int] = Field(None, alias="revisionCount")
    original_submission_date: Optional[str] = Field(None, alias="originalSubmissionDate")
    proposal_file_name: Optional[str] = Field(None, alias="proposalFileName")
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}