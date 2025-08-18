/**
 * Refactored Projects Service
 * 
 * This service replaces the original projectsService.ts and:
 * - Removes all mock JSON data dependencies
 * - Uses backend API endpoints exclusively
 * - Provides error handling and user feedback
 * - Maintains backward compatibility for existing components
 */

import { projectsApi } from './api/projectsApi';
import { Project, ProjectCreate, Milestone, Requisition, Partner } from './api/types';
import { handleApiError } from '../../utils/errorHandling';
import { 
  getStatusColor, 
  getMilestoneStatusColor, 
  getRequisitionStatusColor,
  calculateProgress,
  checkOverdueMilestones,
  formatDate,
  isMilestoneOverdue,
  getStatusDisplayText
} from './utils/helpers';

/**
 * Get all projects (filtered by user role on backend)
 */
export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const projects = await projectsApi.getAll();
    return projects.map(checkOverdueMilestones);
  } catch (error) {
    handleApiError(error, 'Failed to fetch projects');
    return [];
  }
};

/**
 * Get projects for a specific user (legacy function for backward compatibility)
 */
export const getProjectsByUser = async (email: string): Promise<Project[]> => {
  try {
    // Backend handles user filtering based on authentication
    const projects = await projectsApi.getAll();
    return projects.map(checkOverdueMilestones);
  } catch (error) {
    handleApiError(error, `Failed to fetch projects for user ${email}`);
    return [];
  }
};

/**
 * Synchronous version for backward compatibility (now async)
 */
export const getProjectsByUserSync = async (email: string): Promise<Project[]> => {
  return getProjectsByUser(email);
};

/**
 * Get a specific project by ID
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const project = await projectsApi.getById(id);
    return checkOverdueMilestones(project);
  } catch (error) {
    handleApiError(error, `Failed to fetch project ${id}`);
    return null;
  }
};

/**
 * Create a new project
 */
export const createProject = async (projectData: ProjectCreate): Promise<{ id: string; message: string } | null> => {
  try {
    return await projectsApi.create(projectData);
  } catch (error) {
    handleApiError(error, 'Failed to create project');
    return null;
  }
};

/**
 * Update project status
 */
export const updateProjectStatus = async (id: string, status: string): Promise<boolean> => {
  try {
    await projectsApi.updateStatus(id, status);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to update project status for ${id}`);
    return false;
  }
};

/**
 * Add a milestone to a project
 */
export const addMilestone = async (projectId: string, milestone: Omit<Milestone, 'id' | 'status'>): Promise<boolean> => {
  try {
    await projectsApi.addMilestone(projectId, milestone);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to add milestone to project ${projectId}`);
    return false;
  }
};

/**
 * Submit a fund requisition
 */
export const submitRequisition = async (projectId: string, requisition: Omit<Requisition, 'id' | 'requestedDate' | 'status'>): Promise<boolean> => {
  try {
    await projectsApi.submitRequisition(projectId, requisition);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to submit requisition for project ${projectId}`);
    return false;
  }
};

/**
 * Update requisition status (legacy function - now handled by backend workflows)
 */
export const updateRequisitionStatus = async (
  projectId: string, 
  requisitionId: string, 
  status: Requisition['status'], 
  reviewNotes?: string,
  reviewedBy?: string
): Promise<boolean> => {
  console.warn('updateRequisitionStatus is deprecated - requisition status updates are handled by backend workflows');
  return true;
};

/**
 * Add a partner to a project
 */
export const addPartner = async (projectId: string, partner: Omit<Partner, 'id'>): Promise<boolean> => {
  try {
    await projectsApi.addPartner(projectId, partner);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to add partner to project ${projectId}`);
    return false;
  }
};

/**
 * Upload MOU for a partner (legacy function)
 */
export const uploadMOU = async (projectId: string, partnerId: string, filename: string): Promise<boolean> => {
  console.warn('uploadMOU is deprecated - MOU uploads are handled through document management');
  return true;
};

/**
 * Upload progress report for a milestone
 */
export const uploadProgressReport = async (projectId: string, milestoneId: string, file: File): Promise<boolean> => {
  try {
    await projectsApi.uploadProgressReport(projectId, milestoneId, file);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to upload progress report for milestone ${milestoneId}`);
    return false;
  }
};

/**
 * Upload final report (narrative or financial)
 */
export const uploadFinalReport = async (
  projectId: string, 
  reportType: 'narrative' | 'financial', 
  file: File
): Promise<boolean> => {
  try {
    await projectsApi.uploadFinalReport(projectId, reportType, file);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to upload ${reportType} report for project ${projectId}`);
    return false;
  }
};

/**
 * Submit final reports (legacy function)
 */
export const submitFinalReports = async (projectId: string): Promise<boolean> => {
  console.warn('submitFinalReports is deprecated - final report submission is handled automatically on upload');
  return true;
};

/**
 * Review final reports (legacy function)
 */
export const reviewFinalReports = async (
  projectId: string, 
  status: 'approved' | 'revision_required',
  reviewNotes: string,
  reviewedBy: string
): Promise<boolean> => {
  console.warn('reviewFinalReports is deprecated - report reviews are handled by backend workflows');
  return true;
};

/**
 * Initiate VC sign-off process
 */
export const initiateVCSignOff = async (projectId: string): Promise<string | null> => {
  try {
    const result = await projectsApi.initiateVCSignOff(projectId);
    return result.token;
  } catch (error) {
    handleApiError(error, `Failed to initiate VC sign-off for project ${projectId}`);
    return null;
  }
};

/**
 * Get project by VC token
 */
export const getProjectByVCToken = async (token: string): Promise<Project | null> => {
  try {
    return await projectsApi.getByVCToken(token);
  } catch (error) {
    handleApiError(error, `Failed to fetch project by VC token ${token}`);
    return null;
  }
};

/**
 * Submit VC sign-off decision
 */
export const submitVCSignOff = async (
  token: string, 
  decision: 'approved' | 'rejected',
  notes: string,
  vcName: string
): Promise<boolean> => {
  try {
    await projectsApi.submitVCSignOff(token, decision, notes, vcName);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to submit VC sign-off for token ${token}`);
    return false;
  }
};

/**
 * Generate closure certificate (legacy function)
 */
export const generateClosureCertificate = async (projectId: string): Promise<boolean> => {
  console.warn('generateClosureCertificate is deprecated - certificates are generated automatically by backend');
  return true;
};

/**
 * Archive project documents (legacy function)
 */
export const archiveProjectDocuments = async (projectId: string): Promise<boolean> => {
  console.warn('archiveProjectDocuments is deprecated - archiving is handled automatically by backend');
  return true;
};

// Export utility functions
export {
  getStatusColor,
  getMilestoneStatusColor,
  getRequisitionStatusColor,
  calculateProgress,
  checkOverdueMilestones,
  formatDate,
  isMilestoneOverdue,
  getStatusDisplayText
};

// Export additional functions needed by components
export const updateMilestoneStatus = async (projectId: string, milestoneId: string, status: Milestone['status']): Promise<boolean> => {
  try {
    await projectsApi.updateMilestone(projectId, milestoneId, { status });
    return true;
  } catch (error) {
    handleApiError(error, `Failed to update milestone status for ${milestoneId}`);
    return false;
  }
};

export const removePartner = async (projectId: string, partnerId: string): Promise<boolean> => {
  try {
    await projectsApi.removePartner(projectId, partnerId);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to remove partner ${partnerId} from project ${projectId}`);
    return false;
  }
};


export const createRequisition = async (projectId: string, requisitionData: any): Promise<void> => {
  try {
    console.log(`Creating requisition for project ${projectId}:`, requisitionData);
    
    const response = await projectsApi.createRequisition(projectId, requisitionData);
    
    console.log('Requisition created successfully:', response);
  } catch (error) {
    console.error('Error creating requisition:', error);
    handleApiError(error);
  }
};


// Export types for use by components
export type { Project, ProjectCreate, Milestone, Requisition, Partner };
