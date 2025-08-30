/**
 * Refactored Applications Service - Clean Backend-Only Implementation
 * 
 * This is a refactored version that:
 * - Removes all mock JSON data dependencies
 * - Eliminates localStorage caching
 * - Uses the new modular API structure
 * - Provides backward compatibility for existing components
 */

// Import from the new modular structure
import {
  // Types
  Application,
  ResearcherBiodata,
  ReviewHistoryEntry,
  SignOffApproval,
  RevisionNote,
  
  // API functions
  getApplication as apiGetApplication,
  getAllApplications as apiGetAllApplications,
  getUserApplications as apiGetUserApplications,
  submitApplication as apiSubmitApplication,
  updateApplicationStatus as apiUpdateApplicationStatus,
  withdrawApplication as apiWithdrawApplication,
  markApplicationEditable as apiMarkApplicationEditable,
  resubmitApplication as apiResubmitApplication,
  updateApplicationForRevision as apiUpdateApplicationForRevision,
  generateAwardLetter as apiGenerateAwardLetter,
  
  addReviewComment as apiAddReviewComment,
  
  initiateSignOffWorkflow as apiInitiateSignOffWorkflow,
  submitSignOffApproval as apiSubmitSignOffApproval,
  getApplicationBySignOffToken as apiGetApplicationBySignOffToken,
  getSignOffStatusApi,
  
  saveBiodata as apiSaveBiodata,
  getBiodata as apiGetBiodata,
  
  // Business logic
  canWithdrawApplication as canWithdraw,
  canResubmitApplication as canResubmit,
  canUpdateApplication as canUpdate,
  getApplicationRevisionHistory as getRevisionHistory,
  getSignOffStatus as getSignOffStatusFromWorkflow,
  generateReviewToken as generateToken,
  
  // Utilities
  getStatusColor as getStatusColorUtil,
  
  // Types for backward compatibility
  type ApplicationSubmissionData,
  type ReviewCommentData
} from './applications';

import { apiClient } from '@/lib/api';

// Re-export types for backward compatibility
export type { Application, ResearcherBiodata, ReviewHistoryEntry, SignOffApproval, RevisionNote };

// Core application operations
export const getApplication = apiGetApplication;
export const getAllApplications = apiGetAllApplications;
export const getUserApplications = apiGetUserApplications;
export const submitApplication = apiSubmitApplication;
export const updateApplicationStatus = apiUpdateApplicationStatus;
export const withdrawApplication = apiWithdrawApplication;
export const markApplicationEditable = apiMarkApplicationEditable;
export const resubmitApplication = apiResubmitApplication;
export const updateApplicationForRevision = apiUpdateApplicationForRevision;
export const generateAwardLetter = apiGenerateAwardLetter;

// Reviewer operations
export const addReviewComment = apiAddReviewComment;

// Sign-off operations
export const initiateSignOffWorkflow = apiInitiateSignOffWorkflow;
export const submitSignOffApproval = apiSubmitSignOffApproval;
export const getApplicationBySignOffToken = apiGetApplicationBySignOffToken;

// Biodata operations
export const saveBiodata = apiSaveBiodata;
export const getBiodata = apiGetBiodata;

// Business logic functions
export const canWithdrawApplication = canWithdraw;
export const canResubmitApplication = canResubmit;
export const canUpdateApplication = canUpdate;
export const getApplicationRevisionHistory = getRevisionHistory;
export const getSignOffStatus = getSignOffStatusFromWorkflow;
export const generateReviewToken = generateToken;

// Utility functions
export const getStatusColor = getStatusColorUtil;

// Award acceptance functions
export const awardAcceptanceService = {
  async submitAwardDecision(applicationId: string, decision: 'accepted' | 'rejected', comments?: string): Promise<void> {
    try {
      await apiClient.post(`/applications/${applicationId}/accept-award`, {
        decision,
        comments: comments?.trim()
      });
    } catch (error) {
      console.error('Error submitting award decision:', error);
      throw error;
    }
  }
};

// Export new document services
export {
  downloadAwardLetter,
  downloadDocument,
  confirmContractReceipt
} from './applications/api/applicationsApi';

// Export the new modular structure for components that want to use it directly
export * from './applications';