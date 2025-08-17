/**
 * Refactored Grant Calls Service
 * 
 * This service replaces the original grantCallsService.ts and:
 * - Removes all mock JSON data dependencies
 * - Eliminates localStorage caching via DataStorage
 * - Uses backend API endpoints exclusively
 * - Provides error handling and user feedback
 */

import { grantCallsApi } from './api/grantCallsApi';
import { GrantCall, GrantCallCreate, GrantCallUpdate } from './api/types';
import { handleApiError } from '../../utils/errorHandling';

/**
 * Get all grant calls
 */
export const getAllCalls = async (): Promise<GrantCall[]> => {
  try {
    return await grantCallsApi.getAll();
  } catch (error) {
    handleApiError(error, 'Failed to fetch grant calls');
    return [];
  }
};

/**
 * Get a specific grant call by ID
 */
export const getCallById = async (id: string): Promise<GrantCall | null> => {
  try {
    return await grantCallsApi.getById(id);
  } catch (error) {
    handleApiError(error, `Failed to fetch grant call ${id}`);
    return null;
  }
};

/**
 * Get grant calls filtered by type
 */
export const getCallsByType = async (type: string): Promise<GrantCall[]> => {
  try {
    return await grantCallsApi.getByType(type);
  } catch (error) {
    handleApiError(error, `Failed to fetch grant calls by type ${type}`);
    return [];
  }
};

/**
 * Get only open grant calls
 */
export const getOpenCalls = async (): Promise<GrantCall[]> => {
  try {
    return await grantCallsApi.getOpen();
  } catch (error) {
    handleApiError(error, 'Failed to fetch open grant calls');
    return [];
  }
};

/**
 * Create a new grant call
 */
export const createCall = async (callData: GrantCallCreate): Promise<GrantCall | null> => {
  try {
    return await grantCallsApi.create(callData);
  } catch (error) {
    handleApiError(error, 'Failed to create grant call');
    return null;
  }
};

/**
 * Update an existing grant call
 */
export const updateCall = async (id: string, updates: GrantCallUpdate): Promise<GrantCall | null> => {
  try {
    return await grantCallsApi.update(id, updates);
  } catch (error) {
    handleApiError(error, `Failed to update grant call ${id}`);
    return null;
  }
};

/**
 * Toggle the status of a grant call between Open and Closed
 */
export const toggleCallStatus = async (id: string): Promise<GrantCall | null> => {
  try {
    return await grantCallsApi.toggleStatus(id);
  } catch (error) {
    handleApiError(error, `Failed to toggle status for grant call ${id}`);
    return null;
  }
};

/**
 * Delete a grant call
 */
export const deleteCall = async (id: string): Promise<boolean> => {
  try {
    await grantCallsApi.delete(id);
    return true;
  } catch (error) {
    handleApiError(error, `Failed to delete grant call ${id}`);
    return false;
  }
};

// Export types for use by components
export type { GrantCall, GrantCallCreate, GrantCallUpdate };
