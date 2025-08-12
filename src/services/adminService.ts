import { apiClient } from '../lib/api';

// Admin service for administrative operations
export interface AdminService {
  resetDatabase(): Promise<{ message: string }>;
}

class AdminServiceImpl implements AdminService {
  async resetDatabase(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/admin/reset-database');
      return response.data;
    } catch (error: any) {
      console.error('Error resetting database:', error);
      
      // Handle different error response formats
      let errorMessage = 'Failed to reset database';
      
      if (error.response) {
        // Handle HTTP error responses
        const { data } = error.response;
        
        if (typeof data === 'object' && data !== null) {
          // Handle standard error format with message
          if ('message' in data) {
            errorMessage = data.message;
          } 
          // Handle FastAPI HTTPException detail format
          else if ('detail' in data) {
            errorMessage = typeof data.detail === 'string' 
              ? data.detail 
              : (data.detail?.message || JSON.stringify(data.detail));
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }
}

export const adminService = new AdminServiceImpl();

// For backward compatibility
export const resetDatabase = (): Promise<{ message: string }> => {
  return adminService.resetDatabase();
};
