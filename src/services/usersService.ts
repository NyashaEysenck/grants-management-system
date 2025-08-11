import { apiClient } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  status?: 'active' | 'inactive';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

class UsersService {

  async getAllUsers(): Promise<User[]> {
    return await apiClient.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await apiClient.get<User>(`/users/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return await apiClient.post<User>('/users', userData);
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    try {
      return await apiClient.put<User>(`/users/${id}`, updates);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/users/${id}`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async resetUserPassword(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/users/${id}/reset-password`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async getUserCountByRole(): Promise<Record<string, number>> {
    return await apiClient.get<Record<string, number>>('/users/stats/by-role');
  }

  async getUserCountByStatus(): Promise<Record<string, number>> {
    return await apiClient.get<Record<string, number>>('/users/stats/by-status');
  }
}

export const usersService = new UsersService();
