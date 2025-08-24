import { Application } from '../types';

/**
 * Get revision history for an application
 */
export const getApplicationRevisionHistory = (application: Application): { 
  count: number; 
  originalDate: string; 
  latestDate: string 
} => {
  return {
    count: application.revisionCount || 0,
    originalDate: application.originalSubmissionDate || application.submissionDate,
    latestDate: application.submissionDate
  };
};

/**
 * Check if application status transition is valid
 */
export const isValidStatusTransition = (
  currentStatus: Application['status'], 
  newStatus: Application['status']
): boolean => {
  const validTransitions: Record<Application['status'], Application['status'][]> = {
    'submitted': ['under_review', 'withdrawn', 'editable'],
    'under_review': ['manager_approved', 'rejected', 'needs_revision'],
    'manager_approved': ['awaiting_signoff', 'rejected'],
    'rejected': ['editable'], // Can be made editable for resubmission
    'withdrawn': ['editable'], // Can be made editable for resubmission
    'editable': ['submitted'],
    'needs_revision': ['submitted', 'editable'],
    'awaiting_signoff': ['signoff_approved', 'rejected'],
    'signoff_approved': ['contract_pending'],
    'contract_pending': ['contract_received'],
    'contract_received': [] // Final state
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get next possible statuses for an application
 */
export const getNextPossibleStatuses = (currentStatus: Application['status']): Application['status'][] => {
  const validTransitions: Record<Application['status'], Application['status'][]> = {
    'submitted': ['under_review', 'withdrawn', 'editable'],
    'under_review': ['manager_approved', 'rejected', 'needs_revision'],
    'manager_approved': ['awaiting_signoff', 'rejected'],
    'rejected': ['editable'],
    'withdrawn': ['editable'],
    'editable': ['submitted'],
    'needs_revision': ['submitted', 'editable'],
    'awaiting_signoff': ['signoff_approved', 'rejected'],
    'signoff_approved': ['contract_pending'],
    'contract_pending': ['contract_received'],
    'contract_received': []
  };

  return validTransitions[currentStatus] || [];
};

/**
 * Check if a status requires specific permissions
 */
export const getStatusPermissions = (status: Application['status']): {
  requiresAdmin: boolean;
  requiresReviewer: boolean;
  requiresApplicant: boolean;
} => {
  const permissions = {
    'submitted': { requiresAdmin: false, requiresReviewer: false, requiresApplicant: true },
    'under_review': { requiresAdmin: true, requiresReviewer: true, requiresApplicant: false },
    'manager_approved': { requiresAdmin: true, requiresReviewer: true, requiresApplicant: false },
    'rejected': { requiresAdmin: true, requiresReviewer: true, requiresApplicant: false },
    'withdrawn': { requiresAdmin: false, requiresReviewer: false, requiresApplicant: true },
    'editable': { requiresAdmin: true, requiresReviewer: false, requiresApplicant: false },
    'needs_revision': { requiresAdmin: true, requiresReviewer: true, requiresApplicant: false },
    'awaiting_signoff': { requiresAdmin: true, requiresReviewer: false, requiresApplicant: false },
    'signoff_approved': { requiresAdmin: true, requiresReviewer: false, requiresApplicant: false },
    'contract_pending': { requiresAdmin: true, requiresReviewer: false, requiresApplicant: false },
    'contract_received': { requiresAdmin: true, requiresReviewer: false, requiresApplicant: false }
  };

  return permissions[status] || { requiresAdmin: false, requiresReviewer: false, requiresApplicant: false };
};

/**
 * Check if an application is in a final state
 */
export const isApplicationInFinalState = (status: Application['status']): boolean => {
  const finalStates: Application['status'][] = ['contract_received', 'rejected', 'withdrawn'];
  return finalStates.includes(status);
};

/**
 * Check if an application is active (can be worked on)
 */
export const isApplicationActive = (application: Application): boolean => {
  const inactiveStates: Application['status'][] = ['contract_received', 'rejected', 'withdrawn'];
  
  // Check if status is inactive
  if (inactiveStates.includes(application.status)) {
    return false;
  }
  
  // Check if past deadline (for submitted applications)
  if (application.status === 'submitted' && application.deadline) {
    const now = new Date();
    const deadline = new Date(application.deadline);
    if (now > deadline) {
      return false;
    }
  }
  
  return true;
};
