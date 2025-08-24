import { Application } from '../types';

/**
 * Application status colors for UI display
 */
export const getStatusColor = (status: Application['status']): string => {
  switch (status) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'manager_approved':
      return 'bg-green-100 text-green-800';
    case 'signoff_approved':
      return 'bg-emerald-100 text-emerald-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'withdrawn':
      return 'bg-gray-100 text-gray-800';
    case 'editable':
      return 'bg-orange-100 text-orange-800';
    case 'needs_revision':
      return 'bg-purple-100 text-purple-800';
    case 'awaiting_signoff':
      return 'bg-purple-100 text-purple-800';
    case 'contract_pending':
      return 'bg-cyan-100 text-cyan-800';
    case 'contract_received':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Human-readable status labels
 */
export const STATUS_LABELS: Record<Application['status'], string> = {
  'submitted': 'Submitted',
  'under_review': 'Under Review',
  'manager_approved': 'Manager Approved',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
  'editable': 'Editable',
  'needs_revision': 'Needs Revision',
  'awaiting_signoff': 'Awaiting Sign-off',
  'signoff_approved': 'Sign-off Approved',
  'contract_pending': 'Contract Pending',
  'contract_received': 'Contract Received'
};

/**
 * Status descriptions for tooltips/help text
 */
export const STATUS_DESCRIPTIONS: Record<Application['status'], string> = {
  'submitted': 'Application has been submitted and is waiting for initial review',
  'under_review': 'Application is being reviewed by assigned reviewers',
  'manager_approved': 'Application has been approved by grants manager and is ready for sign-off process',
  'rejected': 'Application has been rejected and cannot proceed further',
  'withdrawn': 'Application has been withdrawn by the applicant',
  'editable': 'Application can be edited and resubmitted by the applicant',
  'needs_revision': 'Application requires revisions based on reviewer feedback',
  'awaiting_signoff': 'Application is waiting for management sign-off approvals',
  'signoff_approved': 'All sign-offs are complete, ready for contract generation',
  'contract_pending': 'Contract has been generated and sent to applicant',
  'contract_received': 'Signed contract has been received from applicant'
};

/**
 * Priority levels and their colors
 */
export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

/**
 * Sign-off roles and their display names
 */
export const SIGNOFF_ROLES = {
  DORI: 'Director of Research and Innovation',
  DVC: 'Deputy Vice-Chancellor',
  VC: 'Vice-Chancellor'
};

/**
 * Review decision types and their colors
 */
export const REVIEW_DECISION_COLORS = {
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  request_changes: 'bg-yellow-100 text-yellow-800'
};

/**
 * File type icons mapping
 */
export const FILE_TYPE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'text/plain': '📄',
  'default': '📎'
};

/**
 * Maximum file sizes (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  PROPOSAL: 10 * 1024 * 1024, // 10MB
  ANNOTATION: 5 * 1024 * 1024, // 5MB
  CONTRACT: 10 * 1024 * 1024   // 10MB
};

/**
 * Allowed file types for uploads
 */
export const ALLOWED_FILE_TYPES = {
  PROPOSAL: ['.pdf', '.doc', '.docx'],
  ANNOTATION: ['.pdf', '.doc', '.docx'],
  CONTRACT: ['.pdf', '.doc', '.docx']
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  APPLICATIONS: '/applications',
  REVIEWERS: '/reviewers',
  USERS: '/users',
  SIGNOFF: '/signoff'
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  REVIEW_TOKENS: 'review-tokens',
  SIGNOFF_TOKENS: 'signoff-tokens',
  USER_PREFERENCES: 'user-preferences'
};

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  API: 'yyyy-MM-ddTHH:mm:ss.SSSZ'
};
