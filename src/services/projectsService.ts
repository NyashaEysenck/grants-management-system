/**
 * DEPRECATED - Projects Service
 * 
 * This service has been refactored and moved to:
 * - src/services/projects/index.ts (main service)
 * - src/services/projects/api/ (API integration)
 * - src/services/projects/utils/ (utility functions)
 * 
 * Please update your imports to use the new modular structure.
 * This file will be removed in a future version.
 */

// Legacy interfaces for backward compatibility
export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  description: string;
  progressReportUploaded?: boolean;
  progressReportDate?: string;
  progressReportFilename?: string;
  isOverdue?: boolean;
}

export interface Requisition {
  id: string;
  milestoneId: string;
  amount: number;
  requestedDate: string;
  status: 'submitted' | 'approved' | 'rejected';
  notes: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export interface Partner {
  id: string;
  name: string;
  role: string;
  mouFilename?: string;
  uploadedDate?: string;
}

export interface FinalReport {
  narrativeReport?: {
    filename: string;
    uploadedDate: string;
  };
  financialReport?: {
    filename: string;
    uploadedDate: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'revision_required';
  submittedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export interface ClosureWorkflow {
  status: 'pending' | 'vc_review' | 'signed_off' | 'closed';
  vcSignOffToken?: string;
  vcSignedBy?: string;
  vcSignedDate?: string;
  vcNotes?: string;
  closureCertificateGenerated?: boolean;
  closureCertificateDate?: string;
}

export interface Project {
  id: string;
  applicationId: string;
  title: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled' | 'closed';
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  requisitions?: Requisition[];
  partners?: Partner[];
  finalReport?: FinalReport;
  closureWorkflow?: ClosureWorkflow;
}

// Deprecated functions - throw errors to force migration
export const getProjectsByUser = (email: string): never => {
  throw new Error('getProjectsByUser is deprecated. Please import from "services/projects" instead.');
};

export const getProjectsByUserSync = (email: string): never => {
  throw new Error('getProjectsByUserSync is deprecated. Please import from "services/projects" instead.');
};

export const getAllProjects = (): never => {
  throw new Error('getAllProjects is deprecated. Please import from "services/projects" instead.');
};

export const getProjectById = (id: string): never => {
  throw new Error('getProjectById is deprecated. Please import from "services/projects" instead.');
};

// Deprecated utility functions - throw errors to force migration
export const getStatusColor = (status: Project['status']): never => {
  throw new Error('getStatusColor is deprecated. Please import from "services/projects" instead.');
};

export const getMilestoneStatusColor = (status: Milestone['status']): never => {
  throw new Error('getMilestoneStatusColor is deprecated. Please import from "services/projects" instead.');
};

export const getRequisitionStatusColor = (status: Requisition['status']): never => {
  throw new Error('getRequisitionStatusColor is deprecated. Please import from "services/projects" instead.');
};

export const calculateProgress = (milestones: Milestone[]): never => {
  throw new Error('calculateProgress is deprecated. Please import from "services/projects" instead.');
};

export const checkOverdueMilestones = (project: Project): never => {
  throw new Error('checkOverdueMilestones is deprecated. Please import from "services/projects" instead.');
};

// All remaining functions are deprecated - throw errors to force migration
export const submitRequisition = (): never => {
  throw new Error('submitRequisition is deprecated. Please import from "services/projects" instead.');
};

export const updateRequisitionStatus = (): never => {
  throw new Error('updateRequisitionStatus is deprecated. Please import from "services/projects" instead.');
};

export const addPartner = (): never => {
  throw new Error('addPartner is deprecated. Please import from "services/projects" instead.');
};

export const uploadMOU = (): never => {
  throw new Error('uploadMOU is deprecated. Please import from "services/projects" instead.');
};

export const uploadProgressReport = (): never => {
  throw new Error('uploadProgressReport is deprecated. Please import from "services/projects" instead.');
};

export const uploadFinalReport = (): never => {
  throw new Error('uploadFinalReport is deprecated. Please import from "services/projects" instead.');
};

export const submitFinalReports = (): never => {
  throw new Error('submitFinalReports is deprecated. Please import from "services/projects" instead.');
};

export const reviewFinalReports = (): never => {
  throw new Error('reviewFinalReports is deprecated. Please import from "services/projects" instead.');
};

export const initiateVCSignOff = (): never => {
  throw new Error('initiateVCSignOff is deprecated. Please import from "services/projects" instead.');
};

export const getProjectByVCToken = (): never => {
  throw new Error('getProjectByVCToken is deprecated. Please import from "services/projects" instead.');
};

export const submitVCSignOff = (): never => {
  throw new Error('submitVCSignOff is deprecated. Please import from "services/projects" instead.');
};

export const generateClosureCertificate = (): never => {
  throw new Error('generateClosureCertificate is deprecated. Please import from "services/projects" instead.');
};

export const archiveProjectDocuments = (): never => {
  throw new Error('archiveProjectDocuments is deprecated. Please import from "services/projects" instead.');
};
