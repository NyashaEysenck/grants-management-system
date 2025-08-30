import { apiClient } from '../../../lib/api';
import { ReviewHistoryEntry } from '../types';
import { handleReviewerError } from '../utils/errorHandling';

export interface ReviewerAssignmentData {
  reviewer_emails: string[];
}

export interface ReviewCommentData {
  reviewerName: string;
  reviewerEmail: string;
  comments: string;
  status: string;
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
 * Add a review comment to an application
 */
export const addReviewComment = async (
  applicationId: string,
  reviewData: ReviewCommentData
): Promise<{ message: string }> => {
  try {
    console.log(`Adding review comment to application ${applicationId}:`, reviewData);
    
    const response = await apiClient.post(`/applications/${applicationId}/review?new_status=${reviewData.status}`, {
      reviewerName: reviewData.reviewerName,
      reviewerEmail: reviewData.reviewerEmail,
      comments: reviewData.comments,
      status: reviewData.status
    });
    
    console.log('Review comment added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding review comment:', error);
    throw handleReviewerError(error);
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
      grantId: response.grantId,
      applicantName: response.applicantName,
      email: response.email,
      proposalTitle: response.proposalTitle,
      status: response.status,
      submissionDate: response.submissionDate,
      reviewComments: response.reviewComments || '',
      biodata: response.biodata,
      deadline: response.deadline,
      isEditable: response.isEditable,
      reviewHistory: response.reviewHistory || [],
      signOffApprovals: response.signOffApprovals || [],
      awardAmount: response.awardAmount,
      contractFileName: response.contractFileName,
      awardLetterGenerated: response.awardLetterGenerated,
      revisionCount: response.revisionCount || 0,
      originalSubmissionDate: response.originalSubmissionDate,
      proposalFileName: response.proposalFileName
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
