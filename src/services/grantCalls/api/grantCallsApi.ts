import { apiClient } from '../../../lib/api';
import { GrantCall, GrantCallCreate, GrantCallUpdate } from './types';

/**
 * Grant Calls API Service
 * 
 * Provides API integration for grant call management operations.
 * All functions interact with the backend REST API endpoints.
 */

export const grantCallsApi = {
  /**
   * Get all grant calls with optional filtering
   */
  async getAll(filters?: { type?: string; status?: string }): Promise<GrantCall[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type_filter', filters.type);
      if (filters?.status) params.append('status_filter', filters.status);
      
      const queryString = params.toString();
      const url = queryString ? `/grant-calls?${queryString}` : '/grant-calls';
      
      const response = await apiClient.get(url);
      console.log(response)
      return response || [];
    } catch (error) {
      console.error('Error fetching grant calls:', error);
      return [];
    }
  },

  /**
   * Get a specific grant call by ID
   */
  async getById(id: string): Promise<GrantCall> {
    try {
      const response = await apiClient.get(`/grant-calls/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching grant call ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get only open grant calls
   */
  async getOpen(): Promise<GrantCall[]> {
    try {
      const response = await apiClient.get('/grant-calls?status_filter=Open');
      return response || [];
    } catch (error) {
      console.error('Error fetching open grant calls:', error);
      return [];
    }
  },

  /**
   * Get grant calls filtered by type
   */
  async getByType(type: string): Promise<GrantCall[]> {
    try {
      const response = await apiClient.get(`/grant-calls?type_filter=${encodeURIComponent(type)}`);
      return response || [];
    } catch (error) {
      console.error(`Error fetching grant calls by type ${type}:`, error);
      return [];
    }
  },

  /**
   * Create a new grant call
   */
  async create(grantCallData: GrantCallCreate): Promise<GrantCall> {
    try {
      const response = await apiClient.post('/grant-calls', grantCallData);
      return response;
    } catch (error) {
      console.error('Error creating grant call:', error);
      throw error;
    }
  },

  /**
   * Update an existing grant call
   */
  async update(id: string, updates: GrantCallUpdate): Promise<GrantCall> {
    try {
      const response = await apiClient.put(`/grant-calls/${id}`, updates);
      return response;
    } catch (error) {
      console.error(`Error updating grant call ${id}:`, error);
      throw error;
    }
  },

  /**
   * Toggle the status of a grant call between Open and Closed
   */
  async toggleStatus(id: string): Promise<GrantCall> {
    try {
      const response = await apiClient.patch(`/grant-calls/${id}/toggle-status`);
      return response;
    } catch (error) {
      console.error(`Error toggling status for grant call ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a grant call
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/grant-calls/${id}`);
    } catch (error) {
      console.error(`Error deleting grant call ${id}:`, error);
      throw error;
    }
  }
};
