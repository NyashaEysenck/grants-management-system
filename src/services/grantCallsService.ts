
/**
 * DEPRECATED - Grant Calls Service
 * 
 * This service has been refactored and moved to:
 * - src/services/grantCalls/index.ts (main service)
 * - src/services/grantCalls/api/ (API integration)
 * 
 * Please update your imports to use the new modular structure.
 * This file will be removed in a future version.
 */

// Legacy interface for backward compatibility
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

// Deprecated functions - throw errors to force migration
export const getAllCalls = (): never => {
  throw new Error('getAllCalls is deprecated. Please import from "services/grantCalls" instead.');
};

export const getCallById = (id: string): never => {
  throw new Error('getCallById is deprecated. Please import from "services/grantCalls" instead.');
};

export const getCallsByType = (type: string): never => {
  throw new Error('getCallsByType is deprecated. Please import from "services/grantCalls" instead.');
};

export const getOpenCalls = (): never => {
  throw new Error('getOpenCalls is deprecated. Please import from "services/grantCalls" instead.');
};

export const createCall = (call: any): never => {
  throw new Error('createCall is deprecated. Please import from "services/grantCalls" instead.');
};

export const updateCall = (id: string, updates: any): never => {
  throw new Error('updateCall is deprecated. Please import from "services/grantCalls" instead.');
};

export const toggleCallStatus = (id: string): never => {
  throw new Error('toggleCallStatus is deprecated. Please import from "services/grantCalls" instead.');
};

export const deleteCall = (id: string): never => {
  throw new Error('deleteCall is deprecated. Please import from "services/grantCalls" instead.');
};
