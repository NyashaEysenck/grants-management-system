// Re-export types
export type { 
  Application, 
  ResearcherBiodata, 
  ReviewerFeedback, 
  SignOffApproval, 
  RevisionNote 
} from './types';

// Re-export mappers
export { mapApplicationResponse, mapApplicationsList } from './mappers';

// API Layer Exports
export {
  getApplication,
  getAllApplications,
  getUserApplications,
  submitApplication,
  updateApplicationStatus,
  withdrawApplication,
  markApplicationEditable,
  resubmitApplication,
  updateApplicationForRevision,
  type ApplicationSubmissionData,
  type ApplicationUpdateData
} from './api/applicationsApi';

export {
  assignReviewers,
  submitReviewerFeedback,
  getApplicationByReviewToken,
  type ReviewerAssignmentData,
  type ReviewerFeedbackData,
  type ReviewTokenResponse
} from './api/reviewersApi';

export {
  initiateSignOffWorkflow,
  submitSignOffApproval,
  getApplicationBySignOffToken,
  getSignOffStatus as getSignOffStatusApi,
  type SignOffApprovalData,
  type SignOffSubmissionData
} from './api/signOffApi';

export {
  saveBiodata,
  getBiodata
} from './api/biodataApi';

// Business Logic Exports
export {
  canWithdrawApplication,
  canResubmitApplication,
  canUpdateApplication,
  validateApplicationSubmission,
  validateReviewerFeedback,
  validateSignOffApproval
} from './business/applicationValidation';

export {
  getApplicationRevisionHistory,
  isValidStatusTransition,
  getNextPossibleStatuses,
  getStatusPermissions,
  isApplicationInFinalState,
  isApplicationActive
} from './business/statusManagement';

export {
  generateReviewToken,
  getSignOffStatus,
  areAllSignOffsComplete,
  hasRejectedSignOff,
  getNextPendingSignOff,
  calculateApplicationProgress,
  getApplicationPriority,
  isApplicationOverdue,
  getDaysUntilDeadline
} from './business/workflowHelpers';

// Utility Exports
export {
  handleApiError,
  handleApplicationError,
  handleReviewerError,
  handleSignOffError,
  handleBiodataError,
  type ApiError
} from './utils/errorHandling';

export {
  fileToBase64,
  formatFileSize,
  formatDate,
  formatCurrency,
  sanitizeString,
  truncateText,
  snakeToCamel,
  camelToSnake,
  transformKeysToCamel,
  transformKeysToSnake
} from './utils/apiTransformers';

export {
  getStatusColor,
  STATUS_LABELS,
  STATUS_DESCRIPTIONS,
  PRIORITY_COLORS,
  SIGNOFF_ROLES,
  REVIEW_DECISION_COLORS,
  FILE_TYPE_ICONS,
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  PAGINATION_DEFAULTS,
  DATE_FORMATS
} from './utils/constants';
