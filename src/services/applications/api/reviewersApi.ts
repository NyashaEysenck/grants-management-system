import { apiClient } from '../../../lib/api';
import { ReviewerFeedback } from '../types';
import { handleReviewerError } from '../utils/errorHandling';

export interface ReviewerAssignmentData {
  reviewer_emails: string[];
}

export interface ReviewerFeedbackData {
  reviewer_email: string;
  reviewer_name: string;
  comments: string;
  decision: 'approve' | 'reject' | 'request_changes';
  annotated_file_name?: string;
  review_token: string;
}

export interface ReviewTokenResponse {
  email: string;
  token: string;
  link: string;
}

/**
 * Assign reviewers to an application
 */
export const assignReviewers = async (
  applicationId: string, 
  reviewerEmails: string[]
): Promise<{ reviewTokens: ReviewTokenResponse[] }> => {
  try {
    console.log(`Assigning reviewers to application ${applicationId}:`, reviewerEmails);
    
    const response = await apiClient.post(`/reviewers/assign/${applicationId}`, {
      reviewer_emails: reviewerEmails
    });
    
    console.log('Reviewers assigned successfully:', response);
    
    // Generate review links for frontend use
    const reviewTokens = response.review_tokens.map((tokenData: any) => ({
      email: tokenData.email,
      token: tokenData.token,
      link: `${window.location.origin}/review/${tokenData.token}`
    }));
    
    return { reviewTokens };
  } catch (error) {
    handleReviewerError(error);
  }
};

/**
 * Submit reviewer feedback for an application
 */
export const submitReviewerFeedback = async (
  feedback: Omit<ReviewerFeedback, 'id' | 'submittedAt'>
): Promise<{ feedbackId: string }> => {
  try {
    console.log(`Submitting reviewer feedback for application ${feedback.applicationId}:`, feedback);
    
    const response = await apiClient.post(`/reviewers/feedback/${feedback.applicationId}`, {
      reviewer_email: feedback.reviewerEmail,
      reviewer_name: feedback.reviewerName,
      comments: feedback.comments,
      decision: feedback.decision,
      annotated_file_name: feedback.annotatedFileName,
      review_token: feedback.reviewToken
    });
    
    console.log('Reviewer feedback submitted successfully:', response);
    return { feedbackId: response.feedback_id };
  } catch (error) {
    handleReviewerError(error);
  }
};

/**
 * Get application by review token (for reviewers)
 */
export const getApplicationByReviewToken = async (token: string): Promise<any | null> => {
  console.log(`Getting application by review token: ${token}`);
  
  try {
    const response = await apiClient.get(`/reviewers/application/${token}`);
    console.log('Application retrieved by token:', response);
    
    // Convert backend response to frontend Application interface
    const application = {
      id: response.id,
      grantId: response.grantId || response.grant_id,
      applicantName: response.applicantName || response.applicant_name,
      email: response.email,
      proposalTitle: response.proposalTitle || response.proposal_title,
      status: response.status,
      submissionDate: response.submissionDate || response.submission_date,
      reviewComments: response.reviewComments || response.review_comments || '',
      biodata: response.biodata,
      deadline: response.deadline,
      isEditable: response.isEditable || response.is_editable,
      assignedReviewers: response.assignedReviewers || response.assigned_reviewers || [],
      reviewerFeedback: response.reviewerFeedback || response.reviewer_feedback || [],
      signOffApprovals: response.signOffApprovals || response.sign_off_approvals || [],
      awardAmount: response.awardAmount || response.award_amount,
      contractFileName: response.contractFileName || response.contract_file_name,
      awardLetterGenerated: response.awardLetterGenerated || response.award_letter_generated,
      revisionCount: response.revisionCount || response.revision_count || 0,
      originalSubmissionDate: response.originalSubmissionDate || response.original_submission_date,
      proposalFileName: response.proposalFileName || response.proposal_file_name
    };
    
    return application;
  } catch (error: any) {
    console.error('Error getting application by review token:', error);
    
    if (error.response?.status === 404) {
      return null; // Invalid token or application not found
    }
    
    throw error;
  }
};
