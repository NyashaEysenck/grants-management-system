import { Application } from './types';

export const mapApplicationResponse = (src: any): Application => {
  return {
    id: src.id,
    grantId: src.grantId || src.grant_id,
    applicantName: src.applicantName || src.applicant_name,
    email: src.email,
    proposalTitle: src.proposalTitle || src.proposal_title,
    status: src.status || 'submitted',
    submissionDate: src.submissionDate || src.submission_date || src.submitted_at || new Date().toISOString(),
    reviewComments: src.reviewComments || src.review_comments || '',
    biodata: src.biodata,
    deadline: src.deadline,
    isEditable: src.isEditable || src.is_editable || false,
    assignedReviewers: src.assignedReviewers || src.assigned_reviewers || [],
    reviewerFeedback: src.reviewerFeedback || src.reviewer_feedback || [],
    revisionNotes: src.revisionNotes || src.revision_notes || [],
    signOffApprovals: src.signOffApprovals || src.sign_off_approvals || [],
    awardAmount: src.awardAmount || src.award_amount,
    contractFileName: src.contractFileName || src.contract_file_name,
    awardLetterGenerated: src.awardLetterGenerated || src.award_letter_generated || false,
    revisionCount: src.revisionCount || src.revision_count || 0,
    originalSubmissionDate: src.originalSubmissionDate || src.original_submission_date,
    proposalFileName: src.proposalFileName || src.proposal_file_name,
  };
};

export const mapApplicationsList = (list: any[]): Application[] => {
  return list.map(mapApplicationResponse);
};
