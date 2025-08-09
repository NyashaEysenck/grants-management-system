
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';

interface User {
  email: string;
  role: string;
  name: string;
  id?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Try API login first
      try {
        // Create URL-encoded form data for OAuth2 login
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await apiClient.post<LoginResponse>('/auth/login', formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (response.access_token && response.user) {
          // Store token and user data
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          
          setUser(response.user);
          return true;
        }
        return false;
      } catch (apiError) {
        console.log('API login failed, using demo authentication:', apiError);
        
        // Fallback to demo authentication
        if (email === 'demo@example.com' && password === 'demo123') {
          const demoUser = {
            email: 'demo@example.com',
            name: 'Demo User',
            role: 'administrator',
            id: 'demo-user-1'
          };
          
          localStorage.setItem('auth_token', 'demo-token');
          localStorage.setItem('user_data', JSON.stringify(demoUser));
          setUser(demoUser);
          return true;
        }
        
        // Check for other demo users
        const demoUsers = [
          { email: 'admin@example.com', password: 'admin123', role: 'administrator' },
          { email: 'reviewer@example.com', password: 'reviewer123', role: 'reviewer' },
          { email: 'applicant@example.com', password: 'applicant123', role: 'applicant' }
        ];
        
        const demoUser = demoUsers.find(u => u.email === email && u.password === password);
        if (demoUser) {
          const user = {
            email: demoUser.email,
            name: demoUser.role.charAt(0).toUpperCase() + demoUser.role.slice(1) + ' User',
            role: demoUser.role,
            id: `demo-${demoUser.role}`
          };
          
          localStorage.setItem('auth_token', 'demo-token');
          localStorage.setItem('user_data', JSON.stringify(user));
          setUser(user);
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
