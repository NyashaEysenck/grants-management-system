import { Application } from '../types';

/**
 * Check if an application can be withdrawn
 */
export const canWithdrawApplication = (application: Application): boolean => {
  if (application.status !== 'submitted') return false;
  if (application.deadline && new Date() > new Date(application.deadline)) return false;
  return true;
};

/**
 * Check if an application can be resubmitted
 */
export const canResubmitApplication = (application: Application): boolean => {
  // Applications can be resubmitted if they are in editable state, need revision, or were rejected/withdrawn
  const resubmittableStatuses = ['editable', 'needs_revision', 'rejected', 'withdrawn'];
  return resubmittableStatuses.includes(application.status) || 
         (application.status === 'editable' && application.isEditable === true);
};

/**
 * Check if an application can be updated/edited
 */
export const canUpdateApplication = (application: Application): boolean => {
  return application.status === 'needs_revision' || application.status === 'editable';
};

/**
 * Validate application submission data
 */
export const validateApplicationSubmission = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.grantId) errors.push('Grant ID is required');
  if (!data.applicantName) errors.push('Applicant name is required');
  if (!data.email) errors.push('Email is required');
  if (!data.proposalTitle) errors.push('Proposal title is required');

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Budget validation
  if (data.budgetAmount && (isNaN(data.budgetAmount) || data.budgetAmount < 0)) {
    errors.push('Budget amount must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate reviewer feedback data
 */
export const validateReviewerFeedback = (feedback: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!feedback.reviewerEmail) errors.push('Reviewer email is required');
  if (!feedback.reviewerName) errors.push('Reviewer name is required');
  if (!feedback.comments) errors.push('Comments are required');
  if (!feedback.decision) errors.push('Decision is required');
  if (!feedback.reviewToken) errors.push('Review token is required');

  const validDecisions = ['approve', 'reject', 'request_changes'];
  if (feedback.decision && !validDecisions.includes(feedback.decision)) {
    errors.push('Invalid decision value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate sign-off approval data
 */
export const validateSignOffApproval = (approval: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!approval.decision) errors.push('Decision is required');
  
  const validDecisions = ['approved', 'rejected'];
  if (approval.decision && !validDecisions.includes(approval.decision)) {
    errors.push('Invalid decision value');
  }

  if (approval.decision === 'rejected' && !approval.comments) {
    errors.push('Comments are required for rejection');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
