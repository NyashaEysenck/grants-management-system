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
      console.error('Error resetting database:', error.response?.data?.detail || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to reset database.');
    }
  }
}

export const adminService = new AdminServiceImpl();

// For backward compatibility
export const resetDatabase = (): Promise<{ message: string }> => {
  return adminService.resetDatabase();
};
