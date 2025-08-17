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

// Legacy functions that have been removed (now handled by backend)
// These functions are deprecated and will throw errors if used

/**
 * @deprecated This function has been removed. Applications are now fetched by user through getUserApplications()
 */
export const getApplicationsByUser = (email: string): Application[] => {
  throw new Error('getApplicationsByUser is deprecated. Use getUserApplications() instead.');
};

/**
 * @deprecated This function has been removed. Reviewer feedback is now handled through the backend API
 */
export const getReviewHistory = (applicationId: string): ReviewHistoryEntry[] => {
  throw new Error('getReviewHistory is deprecated. Review history is included in application details from the backend.');
};

/**
 * @deprecated This function has been removed. Application status changes are now handled through the backend API
 */
export const markApplicationNeedsRevision = (id: string, feedback: string): boolean => {
  throw new Error('markApplicationNeedsRevision is deprecated. Use updateApplicationStatus() instead.');
};

/**
 * @deprecated This function has been removed. Token storage is now handled by the backend
 */
export const storeReviewToken = (applicationId: string, token: string): void => {
  throw new Error('storeReviewToken is deprecated. Token management is now handled by the backend.');
};

/**
 * @deprecated This function has been removed. Token storage is now handled by the backend
 */
export const storeSignOffToken = (applicationId: string, token: string, role: string): void => {
  throw new Error('storeSignOffToken is deprecated. Token management is now handled by the backend.');
};

/**
 * @deprecated This function has been removed. Contract operations are now handled through the backend API
 */
export const submitContract = (applicationId: string, contractFileName: string): boolean => {
  throw new Error('submitContract is deprecated. Contract operations are now handled by the backend.');
};

/**
 * @deprecated This function has been removed. Contract operations are now handled through the backend API
 */
export const confirmContractReceipt = (applicationId: string): boolean => {
  throw new Error('confirmContractReceipt is deprecated. Contract operations are now handled by the backend.');
};

// Migration helper functions for components that need to update their usage

/**
 * Helper function to migrate from old getApplicationsByUser to new getUserApplications
 */
export const migrateGetApplicationsByUser = async (email: string): Promise<Application[]> => {
  console.warn('Using deprecated pattern. Please update to use getUserApplications() directly.');
  return getUserApplications();
};

// Export the new modular structure for components that want to use it directly
export * from './applications';
