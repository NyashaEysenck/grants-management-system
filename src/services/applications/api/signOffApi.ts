import { apiClient } from '../../../lib/api';
import { SignOffApproval } from '../types';
import { handleSignOffError } from '../utils/errorHandling';

export interface SignOffApprovalData {
  role: 'DORI' | 'DVC' | 'VC';
  email: string;
  name?: string;
}

export interface SignOffSubmissionData {
  decision: 'approved' | 'rejected';
  comments?: string;
  approverName?: string;
}

/**
 * Initiate sign-off workflow for a manager approved application
 */
export const initiateSignOffWorkflow = async (
  applicationId: string,
  awardAmount: number,
  approvers: SignOffApprovalData[]
): Promise<{ success: boolean; signOffTokens?: Array<{ role: string; token: string; email: string }> }> => {
  try {
    console.log(`Initiating sign-off workflow for application ${applicationId}`);
    console.log('Award amount:', awardAmount);
    console.log('Approvers:', approvers);
    
    const response = await apiClient.post(`/applications/${applicationId}/signoff/initiate`, {
      award_amount: awardAmount,
      approvers: approvers.map(approver => ({
        role: approver.role,
        email: approver.email,
        name: approver.name
      }))
    });
    
    console.log('Sign-off workflow initiated successfully:', response);
    
    return {
      success: true,
      signOffTokens: response.sign_off_tokens || []
    };
  } catch (error) {
    handleSignOffError(error);
  }
};

/**
 * Submit sign-off approval/rejection
 */
export const submitSignOffApproval = async (
  token: string,
  submissionData: SignOffSubmissionData
): Promise<{ success: boolean; application?: any }> => {
  try {
    console.log(`Submitting sign-off approval for token: ${token}`);
    console.log('Submission data:', submissionData);
    
    const response = await apiClient.post(`/applications/signoff/${token}`, {
      decision: submissionData.decision,
      comments: submissionData.comments || '',
      approver_name: submissionData.approverName
    });
    
    console.log('Sign-off approval submitted successfully:', response);
    
    return {
      success: true,
      application: response.application
    };
  } catch (error) {
    handleSignOffError(error);
  }
};

/**
 * Get application and approval details by sign-off token
 */
export const getApplicationBySignOffToken = async (
  token: string
): Promise<{ application: any; approval: SignOffApproval } | null> => {
  try {
    console.log(`Getting application by sign-off token: ${token}`);
    
    const response = await apiClient.get(`/applications/signoff/${token}`);
    console.log('Application and approval retrieved by token:', response);
    
    return {
      application: response.application,
      approval: response.approval
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Invalid token or application not found
    }
    handleSignOffError(error);
  }
};

/**
 * Get sign-off status for an application
 */
export const getSignOffStatus = async (
  applicationId: string
): Promise<{ current: string; completed: number; total: number }> => {
  try {
    console.log(`Getting sign-off status for application: ${applicationId}`);
    
    const response = await apiClient.get(`/applications/${applicationId}/signoff/status`);
    console.log('Sign-off status retrieved:', response);
    
    return {
      current: response.current_status || 'Not initiated',
      completed: response.completed_approvals || 0,
      total: response.total_approvals || 0
    };
  } catch (error: any) {
    // Return default status if not found or error
    return { current: 'Not initiated', completed: 0, total: 0 };
  }
};
