
import { apiClient } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: string;
  status?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

class UsersService {
  async getAllUsers(): Promise<User[]> {
    return await apiClient.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await apiClient.get<User>(`/users/${id}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async createUser(userData: UserCreate): Promise<User> {
    return await apiClient.post<User>('/users', userData);
  }

  async updateUser(id: string, updates: UserUpdate): Promise<User | null> {
    try {
      return await apiClient.put<User>(`/users/${id}`, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/users/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async resetUserPassword(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/users/${id}/reset-password`);
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  async getUserCountByRole(): Promise<Record<string, number>> {
    try {
      return await apiClient.get<Record<string, number>>('/users/count-by-role');
    } catch (error) {
      console.error('Error fetching user count by role:', error);
      return {};
    }
  }

  async getUserCountByStatus(): Promise<Record<string, number>> {
    try {
      return await apiClient.get<Record<string, number>>('/users/count-by-status');
    } catch (error) {
      console.error('Error fetching user count by status:', error);
      return {};
    }
  }
}

export const usersService = new UsersService();
