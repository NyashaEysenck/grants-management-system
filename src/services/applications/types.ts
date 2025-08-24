export interface ResearcherBiodata {
  name: string;
  age: number;
  email: string;
  firstTimeApplicant: boolean;
}

export interface ReviewHistoryEntry {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  comments: string;
  submittedAt: string;
  status: string;
  annotatedFileName?: string;
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
  status: 'submitted' | 'under_review' | 'manager_approved' | 'rejected' | 'withdrawn' | 'editable' | 'awaiting_signoff' | 'signoff_approved' | 'contract_pending' | 'contract_received' | 'needs_revision';
  submissionDate: string;
  reviewComments: string;
  biodata?: ResearcherBiodata;
  deadline?: string;
  isEditable?: boolean;
  reviewHistory?: ReviewHistoryEntry[];
  revisionNotes?: RevisionNote[];
  signOffApprovals?: SignOffApproval[];
  awardAmount?: number;
  contractFileName?: string;
  awardLetterGenerated?: boolean;
  revisionCount?: number;
  originalSubmissionDate?: string;
  proposalFileName?: string;
  proposalFileSize?: number;
  proposalFileType?: string;
}
