
import grantCallsData from '../data/grantCalls.json';
import { DataStorage } from '../utils/dataStorage';

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
}

// Initialize persistent storage with fallback to JSON data
let grantCallsCache: GrantCall[] = DataStorage.initializeFromJSON('grantCalls', grantCallsData.grantCalls as GrantCall[]);

/**
 * Get all grant calls
 */
export const getAllCalls = (): GrantCall[] => {
  return [...grantCallsCache];
};

/**
 * Get a specific grant call by ID
 */
export const getCallById = (id: string): GrantCall | undefined => {
  return grantCallsCache.find(call => call.id === id);
};

/**
 * Get grant calls filtered by type
 */
export const getCallsByType = (type: string): GrantCall[] => {
  return grantCallsCache.filter(call => 
    call.type.toLowerCase() === type.toLowerCase()
  );
};

/**
 * Get only open grant calls
 */
export const getOpenCalls = (): GrantCall[] => {
  return grantCallsCache.filter(call => call.status === 'Open');
};

/**
 * Create a new grant call
 */
export const createCall = (call: Omit<GrantCall, 'id'>): GrantCall => {
  const newCall: GrantCall = {
    ...call,
    id: `gc-${Date.now().toString().slice(-6)}`,
  };
  grantCallsCache.push(newCall);
  DataStorage.saveGrantCalls(grantCallsCache);
  return newCall;
};

/**
 * Update an existing grant call
 */
export const updateCall = (id: string, updates: Partial<Omit<GrantCall, 'id'>>): boolean => {
  const index = grantCallsCache.findIndex(call => call.id === id);
  if (index !== -1) {
    grantCallsCache[index] = { ...grantCallsCache[index], ...updates };
    DataStorage.saveGrantCalls(grantCallsCache);
    return true;
  }
  return false;
};

/**
 * Toggle the status of a grant call between Open and Closed
 */
export const toggleCallStatus = (id: string): boolean => {
  const call = grantCallsCache.find(call => call.id === id);
  if (call) {
    call.status = call.status === 'Open' ? 'Closed' : 'Open';
    DataStorage.saveGrantCalls(grantCallsCache);
    return true;
  }
  return false;
};

/**
 * Delete a grant call
 */
export const deleteCall = (id: string): boolean => {
  const initialLength = grantCallsCache.length;
  grantCallsCache = grantCallsCache.filter(call => call.id !== id);
  if (grantCallsCache.length < initialLength) {
    DataStorage.saveGrantCalls(grantCallsCache);
    return true;
  }
  return false;
};
