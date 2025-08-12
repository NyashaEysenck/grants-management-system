export interface ResearcherBiodata {
  name: string;
  age: number;
  email: string;
  firstTimeApplicant: boolean;
}

export interface ReviewerFeedback {
  id: string;
  applicationId: string;
  reviewerEmail: string;
  reviewerName?: string;
  comments: string;
  decision: 'approve' | 'reject' | 'request_changes';
  annotatedFileName?: string;
  submittedAt: string;
  reviewToken: string;
}

export interface SignOffApproval {
  id: string;
  applicationId: string;
  role: 'DORI' | 'DVC' | 'VC';
  approverEmail: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
  signOffToken: string;
}

export interface RevisionNote {
  id: string;
  revisionNumber: number;
  notes: string;
  submittedAt: string;
}

export interface Application {
  id: string;
  grantId: string;
  applicantName: string;
  email: string;
  proposalTitle: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn' | 'editable' | 'awaiting_signoff' | 'signoff_complete' | 'contract_pending' | 'contract_received' | 'needs_revision';
  submissionDate: string;
  reviewComments: string;
  biodata?: ResearcherBiodata;
  deadline?: string;
  isEditable?: boolean;
  assignedReviewers?: string[];
  reviewerFeedback?: ReviewerFeedback[];
  revisionNotes?: RevisionNote[];
  signOffApprovals?: SignOffApproval[];
  awardAmount?: number;
  contractFileName?: string;
  awardLetterGenerated?: boolean;
  revisionCount?: number;
  originalSubmissionDate?: string;
  proposalFileName?: string;
}
