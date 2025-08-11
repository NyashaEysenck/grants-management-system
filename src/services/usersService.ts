
import usersData from '../data/users.json';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

class UsersService {
  private users: User[] = [];

  constructor() {
    // Initialize with existing users and add missing fields
    this.users = usersData.users.map((user, index) => ({
      id: `user-${index + 1}`,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    }));
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return this.users.length < initialLength;
  }

  async resetUserPassword(id: string): Promise<boolean> {
    const user = this.users.find(user => user.id === id);
    if (!user) return false;

    // Generate a temporary password
    user.password = `temp${Math.random().toString(36).substring(2, 8)}`;
    return true;
  }

  getUserCountByRole(): Record<string, number> {
    return this.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  getUserCountByStatus(): Record<string, number> {
    return this.users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const usersService = new UsersService();
