from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class ReviewerFeedbackCreate(BaseModel):
    reviewer_email: EmailStr = Field(alias="reviewerEmail")
    reviewer_name: str = Field(alias="reviewerName")
    score: int
    comments: str
    decision: str
    
    class Config:
        allow_population_by_field_name = True

class SignOffApprovalCreate(BaseModel):
    role: str
    name: str
    status: str
    notes: Optional[str] = None
    
    class Config:
        allow_population_by_field_name = True

class ApplicationCreate(BaseModel):
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
    proposal_file_name: Optional[str] = Field(None, alias="proposalFileName")
    
    class Config:
        allow_population_by_field_name = True

class ApplicationUpdate(BaseModel):
    title: Optional[str] = None
    project_summary: Optional[str] = Field(None, alias="projectSummary")
    objectives: Optional[str] = None
    methodology: Optional[str] = None
    expected_outcomes: Optional[str] = Field(None, alias="expectedOutcomes")
    budget_amount: Optional[float] = Field(None, alias="budgetAmount")
    budget_justification: Optional[str] = Field(None, alias="budgetJustification")
    timeline: Optional[str] = None
    biodata: Optional[str] = None
    status: Optional[str] = None
    is_editable: Optional[bool] = Field(None, alias="isEditable")
    assigned_reviewers: Optional[List[str]] = Field(None, alias="assignedReviewers")
    award_amount: Optional[float] = Field(None, alias="awardAmount")
    contract_file_name: Optional[str] = Field(None, alias="contractFileName")
    award_letter_generated: Optional[bool] = Field(None, alias="awardLetterGenerated")
    
    class Config:
        allow_population_by_field_name = True

class ReviewerFeedbackResponse(BaseModel):
    reviewer_email: EmailStr = Field(alias="reviewerEmail")
    reviewer_name: str = Field(alias="reviewerName")
    score: int
    comments: str
    decision: str
    reviewed_at: str = Field(alias="reviewedAt")
    
    class Config:
        allow_population_by_field_name = True

class SignOffApprovalResponse(BaseModel):
    role: str
    name: str
    status: str
    date: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        allow_population_by_field_name = True

class ApplicationResponse(BaseModel):
    id: str
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
    status: str
    reviewer_feedback: List[ReviewerFeedbackResponse] = Field(alias="reviewerFeedback")
    final_decision: Optional[str] = Field(alias="finalDecision")
    decision_notes: Optional[str] = Field(alias="decisionNotes")
    is_editable: bool = Field(alias="isEditable")
    assigned_reviewers: List[str] = Field(alias="assignedReviewers")
    sign_off_approvals: List[SignOffApprovalResponse] = Field(alias="signOffApprovals")
    award_amount: Optional[float] = Field(alias="awardAmount")
    contract_file_name: Optional[str] = Field(alias="contractFileName")
    award_letter_generated: bool = Field(alias="awardLetterGenerated")
    revision_count: int = Field(alias="revisionCount")
    original_submission_date: str = Field(alias="originalSubmissionDate")
    proposal_file_name: Optional[str] = Field(alias="proposalFileName")
    submitted_at: str = Field(alias="submittedAt")
    updated_at: str = Field(alias="updatedAt")
    
    class Config:
        allow_population_by_field_name = True