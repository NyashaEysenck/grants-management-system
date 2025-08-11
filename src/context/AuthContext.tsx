
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';
import { setAuthInitializing } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
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

  // Check for existing token and user data on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
      
      // Prevent API interceptor from interfering during initialization
      setAuthInitializing(true);
      
      try {
        const userData = authService.getUserData();
        const accessToken = authService.getAccessToken();
        const refreshToken = authService.getRefreshToken();
        
        console.log('📊 Auth state check:', {
          hasUserData: !!userData,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userEmail: userData?.email
        });
        
        if (userData && accessToken) {
          // Check if token is valid, if not try to refresh
          const isExpired = authService.isTokenExpired(accessToken);
          console.log('⏰ Token expiration check:', { isExpired });
          
          if (isExpired) {
            console.log('🔄 Token expired, attempting refresh...');
            try {
              const response = await authService.refreshToken();
              if (response) {
                console.log('✅ Token refresh successful');
                setUser(userData);
              } else {
                console.log('❌ Token refresh failed - no response');
                authService.clearTokens();
                setUser(null);
              }
            } catch (refreshError) {
              console.error('❌ Token refresh failed during initialization:', refreshError);
              authService.clearTokens();
              setUser(null);
            }
          } else {
            console.log('✅ Token is valid, setting user');
            setUser(userData);
          }
        } else {
          console.log('❌ Missing user data or access token');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        authService.clearTokens();
        setUser(null);
      } finally {
        // Re-enable API interceptor after initialization
        setAuthInitializing(false);
        setLoading(false);
        console.log('🏁 Auth initialization complete');
      }
    };

    initializeAuth();
  }, []); // No dependencies needed since we're calling authService directly

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await authService.login(email, password, role);
      
      if (response.access_token && response.user) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken();
      return !!response;
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      authService.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
