import { apiClient } from '../lib/api';

export interface GrantCall {
  id: string;
  title: string;
  type: string;
  sponsor: string;
  deadline: string;
  scope: string;
  eligibility: string;
  requirements: string;
  status: 'Open' | 'Closed';
  visibility: 'Public' | 'Restricted';
  createdAt?: string;
  updatedAt?: string;
}

// Backend response type (snake_case timestamps)
type GrantCallResponse = {
  id: string;
  title: string;
  type: string;
  sponsor: string;
  deadline: string;
  scope: string;
  eligibility: string;
  requirements: string;
  status: 'Open' | 'Closed';
  visibility: 'Public' | 'Restricted';
  created_at?: string;
  updated_at?: string;
};

const mapGrantCall = (gc: GrantCallResponse): GrantCall => ({
  id: gc.id,
  title: gc.title,
  type: gc.type,
  sponsor: gc.sponsor,
  deadline: gc.deadline,
  scope: gc.scope,
  eligibility: gc.eligibility,
  requirements: gc.requirements,
  status: gc.status,
  visibility: gc.visibility,
  createdAt: gc.created_at,
  updatedAt: gc.updated_at,
});

/**
 * Get all grant calls (backend)
 */
export const getAllCalls = async (): Promise<GrantCall[]> => {
  try {
    const res = await apiClient.get('/grant-calls');
    return (res as GrantCallResponse[]).map(mapGrantCall);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to load grant calls';
    throw new Error(message);
  }
};

/**
 * Get a specific grant call by ID (backend)
 */
export const getCallById = async (id: string): Promise<GrantCall> => {
  try {
    const res = await apiClient.get(`/grant-calls/${id}`);
    return mapGrantCall(res as GrantCallResponse);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to load grant call';
    throw new Error(message);
  }
};

/**
 * Get grant calls filtered by type (backend)
 */
export const getCallsByType = async (type: string): Promise<GrantCall[]> => {
  try {
    const res = await apiClient.get(`/grant-calls`, { params: { type_filter: type } });
    return (res as GrantCallResponse[]).map(mapGrantCall);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to load grant calls by type';
    throw new Error(message);
  }
};

/**
 * Get only open grant calls (backend)
 */
export const getOpenCalls = async (): Promise<GrantCall[]> => {
  try {
    const res = await apiClient.get(`/grant-calls`, { params: { status_filter: 'Open' } });
    return (res as GrantCallResponse[]).map(mapGrantCall);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to load open grant calls';
    throw new Error(message);
  }
};

/**
 * Create a new grant call (backend)
 */
export const createCall = async (call: Omit<GrantCall, 'id' | 'createdAt' | 'updatedAt'>): Promise<GrantCall> => {
  try {
    const payload = {
      title: call.title,
      type: call.type,
      sponsor: call.sponsor,
      deadline: call.deadline,
      scope: call.scope,
      eligibility: call.eligibility,
      requirements: call.requirements,
      status: call.status,
      visibility: call.visibility,
    };
    const res = await apiClient.post('/grant-calls', payload);
    return mapGrantCall(res as GrantCallResponse);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to create grant call';
    throw new Error(message);
  }
};

/**
 * Update an existing grant call (backend)
 */
export const updateCall = async (id: string, updates: Partial<Omit<GrantCall, 'id' | 'createdAt' | 'updatedAt'>>): Promise<GrantCall> => {
  try {
    const res = await apiClient.put(`/grant-calls/${id}`, updates);
    return mapGrantCall(res as GrantCallResponse);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to update grant call';
    throw new Error(message);
  }
};

/**
 * Toggle the status of a grant call between Open and Closed (backend)
 */
export const toggleCallStatus = async (id: string): Promise<GrantCall> => {
  try {
    const res = await apiClient.patch(`/grant-calls/${id}/toggle-status`);
    return mapGrantCall(res as GrantCallResponse);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to toggle grant call status';
    throw new Error(message);
  }
};

/**
 * Delete a grant call (backend)
 */
export const deleteCall = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/grant-calls/${id}`);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to delete grant call';
    throw new Error(message);
  }
};
