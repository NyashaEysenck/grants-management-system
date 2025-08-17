import { apiClient } from '../../../lib/api';
import { Project, Milestone, Partner, Requisition, FinalReport, ProjectCreate } from '../api/types';

/**
 * Projects API Service
 * 
 * Provides API integration for project management operations.
 * All functions interact with the backend REST API endpoints.
 */

export const projectsApi = {
  /**
   * Get all projects (admin/manager view) or user-specific projects (researcher view)
   */
  async getAll(): Promise<Project[]> {
    try {
      const response = await apiClient.get('/projects');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  /**
   * Get a specific project by ID
   */
  async getById(id: string): Promise<Project> {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new project
   */
  async create(projectData: ProjectCreate): Promise<{ id: string; message: string }> {
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update project status
   */
  async updateStatus(id: string, status: string): Promise<void> {
    try {
      await apiClient.patch(`/projects/${id}/status`, { status });
    } catch (error) {
      console.error(`Error updating project status for ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a milestone to a project
   */
  async addMilestone(projectId: string, milestone: Omit<Milestone, 'id' | 'status'>): Promise<void> {
    try {
      await apiClient.post(`/projects/${projectId}/milestones`, milestone);
    } catch (error) {
      console.error(`Error adding milestone to project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Submit a fund requisition
   */
  async submitRequisition(projectId: string, requisition: Omit<Requisition, 'id' | 'requestedDate' | 'status'>): Promise<void> {
    try {
      await apiClient.post(`/projects/${projectId}/requisitions`, requisition);
    } catch (error) {
      console.error(`Error submitting requisition for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Add a partner to a project
   */
  async addPartner(projectId: string, partner: Omit<Partner, 'id'>): Promise<void> {
    try {
      await apiClient.post(`/projects/${projectId}/partners`, partner);
    } catch (error) {
      console.error(`Error adding partner to project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Upload progress report for a milestone
   */
  async uploadProgressReport(projectId: string, milestoneId: string, file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiClient.post(`/projects/${projectId}/milestones/${milestoneId}/progress-report`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error(`Error uploading progress report for milestone ${milestoneId}:`, error);
      throw error;
    }
  },

  /**
   * Upload final report (narrative or financial)
   */
  async uploadFinalReport(projectId: string, reportType: 'narrative' | 'financial', file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiClient.post(`/projects/${projectId}/final-report/${reportType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error(`Error uploading ${reportType} report for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Initiate VC sign-off process
   */
  async initiateVCSignOff(projectId: string): Promise<{ message: string; token: string }> {
    try {
      const response = await apiClient.post(`/projects/${projectId}/initiate-vc-signoff`);
      return response.data;
    } catch (error) {
      console.error(`Error initiating VC sign-off for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get project by VC token (for VC sign-off page)
   */
  async getByVCToken(token: string): Promise<Project> {
    try {
      const response = await apiClient.get(`/projects/vc-signoff/${token}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project by VC token ${token}:`, error);
      throw error;
    }
  },

  /**
   * Submit VC sign-off decision
   */
  submitVCSignOff: async (token: string, decision: string, notes: string, vcName: string): Promise<void> => {
    console.log(`Submitting VC sign-off for token ${token}:`, { decision, notes, vcName });
    
    const response = await apiClient.post(`/projects/vc-signoff/${token}/submit`, {
      decision,
      notes,
      vc_name: vcName
    });
    
    console.log('VC sign-off submitted successfully:', response);
  },

  /**
   * Update milestone status - PLACEHOLDER (Backend endpoint not implemented)
   */
  updateMilestone: async (projectId: string, milestoneId: string, updates: Partial<Milestone>): Promise<void> => {
    console.warn(`updateMilestone not implemented in backend - projectId: ${projectId}, milestoneId: ${milestoneId}`);
    // TODO: Implement PUT /projects/{id}/milestones/{milestone_id} in backend
    throw new Error('Milestone update endpoint not implemented in backend');
  },

  /**
   * Remove partner from project - PLACEHOLDER (Backend endpoint not implemented)
   */
  removePartner: async (projectId: string, partnerId: string): Promise<void> => {
    console.warn(`removePartner not implemented in backend - projectId: ${projectId}, partnerId: ${partnerId}`);
    // TODO: Implement DELETE /projects/{id}/partners/{partner_id} in backend
    throw new Error('Partner removal endpoint not implemented in backend');
  },

  /**
   * Complete VC sign-off process - PLACEHOLDER (Backend endpoint not implemented)
   */
  completeVCSignOff: async (token: string): Promise<void> => {
    console.warn(`completeVCSignOff not implemented in backend - token: ${token}`);
    // TODO: Implement POST /projects/complete-signoff/{token} in backend
    throw new Error('Complete VC sign-off endpoint not implemented in backend');
  },

  /**
   * Create requisition for project
   */
  createRequisition: async (projectId: string, requisitionData: any): Promise<void> => {
    console.log(`Creating requisition for project ${projectId}:`, requisitionData);
    
    const response = await apiClient.post(`/projects/${projectId}/requisitions`, requisitionData);
    
    console.log('Requisition created successfully:', response);
  },
};
