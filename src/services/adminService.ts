import apiClient from './apiClient';

export const resetDatabase = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post('/admin/reset-database');
    return response.data;
  } catch (error: any) {
    console.error('Error resetting database:', error.response?.data?.detail || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to reset database.');
  }
};
