import { Application, SignOffApproval } from '../types';

/**
 * Generate a random token for reviews and sign-offs
 */
export const generateReviewToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Get sign-off status summary for an application
 */
export const getSignOffStatus = (application: Application): { 
  current: string; 
  completed: number; 
  total: number 
} => {
  if (!application.signOffApprovals) {
    return { current: 'Not initiated', completed: 0, total: 0 };
  }
  
  const approved = application.signOffApprovals.filter(a => a.status === 'approved');
  const rejected = application.signOffApprovals.filter(a => a.status === 'rejected');
  const pending = application.signOffApprovals.filter(a => a.status === 'pending');
  
  if (rejected.length > 0) {
    return { 
      current: `Rejected by ${rejected[0].role}`, 
      completed: approved.length, 
      total: application.signOffApprovals.length 
    };
  }
  
  if (pending.length === 0) {
    return { 
      current: 'All approvals complete', 
      completed: approved.length, 
      total: application.signOffApprovals.length 
    };
  }
  
  const nextPending = pending[0];
  return { 
    current: `Awaiting ${nextPending.role} approval`, 
    completed: approved.length, 
    total: application.signOffApprovals.length 
  };
};

/**
 * Check if all sign-off approvals are complete
 */
export const areAllSignOffsComplete = (signOffApprovals: SignOffApproval[]): boolean => {
  if (!signOffApprovals || signOffApprovals.length === 0) {
    return false;
  }
  
  return signOffApprovals.every(approval => approval.status === 'approved');
};

/**
 * Check if any sign-off approval was rejected
 */
export const hasRejectedSignOff = (signOffApprovals: SignOffApproval[]): boolean => {
  if (!signOffApprovals || signOffApprovals.length === 0) {
    return false;
  }
  
  return signOffApprovals.some(approval => approval.status === 'rejected');
};

/**
 * Get the next pending sign-off approval
 */
export const getNextPendingSignOff = (signOffApprovals: SignOffApproval[]): SignOffApproval | null => {
  if (!signOffApprovals || signOffApprovals.length === 0) {
    return null;
  }
  
  return signOffApprovals.find(approval => approval.status === 'pending') || null;
};

/**
 * Calculate application progress percentage
 */
export const calculateApplicationProgress = (application: Application): number => {
  const statusWeights: Record<Application['status'], number> = {
    'submitted': 10,
    'under_review': 30,
    'needs_revision': 25,
    'editable': 20,
    'manager_approved': 60,
    'awaiting_signoff': 70,
    'signoff_approved': 85,
    'contract_pending': 90,
    'contract_received': 100,
    'rejected': 0,
    'withdrawn': 0
  };
  
  return statusWeights[application.status] || 0;
};

/**
 * Get application priority based on deadline and status
 */
export const getApplicationPriority = (application: Application): 'high' | 'medium' | 'low' => {
  if (!application.deadline) {
    return 'low';
  }
  
  const now = new Date();
  const deadline = new Date(application.deadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // High priority: less than 7 days or overdue
  if (daysUntilDeadline <= 7) {
    return 'high';
  }
  
  // Medium priority: less than 30 days
  if (daysUntilDeadline <= 30) {
    return 'medium';
  }
  
  return 'low';
};

/**
 * Check if application deadline has passed
 */
export const isApplicationOverdue = (application: Application): boolean => {
  if (!application.deadline) {
    return false;
  }
  
  const now = new Date();
  const deadline = new Date(application.deadline);
  
  return now > deadline;
};

/**
 * Get days until deadline
 */
export const getDaysUntilDeadline = (application: Application): number | null => {
  if (!application.deadline) {
    return null;
  }
  
  const now = new Date();
  const deadline = new Date(application.deadline);
  
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};
