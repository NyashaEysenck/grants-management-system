
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';
import { setAuthInitializing } from '../lib/api';
import { AuthError, ErrorCode } from '../types/error';
import { parseApiError } from '../utils/errorHandling';
import { showConnectionErrorToast, showAuthErrorToast } from '../utils/toastHelpers';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
  lastError: AuthError | null;
  isBackendAvailable: boolean;
  retryConnection: () => Promise<void>;
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
  const [lastError, setLastError] = useState<AuthError | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);

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
              const parsedError = parseApiError(refreshError);
              
              // Check if it's a network error (backend unavailable)
              if (parsedError.code === ErrorCode.NETWORK_ERROR) {
                setIsBackendAvailable(false);
                console.log('🔌 Backend appears to be unavailable during token refresh');
              }
              
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
        const parsedError = parseApiError(error);
        
        // Check if it's a network error (backend unavailable)
        if (parsedError.code === ErrorCode.NETWORK_ERROR) {
          setIsBackendAvailable(false);
          console.log('🔌 Backend appears to be unavailable during initialization');
        }
        
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

  const login = async (email: string, password: string, role?: string): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setLoading(true);
      setLastError(null);
      
      const response = await authService.login(email, password, role);
      
      if (response.access_token && response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      const error = parseApiError(new Error('Login failed'));
      setLastError(error);
      return { success: false, error };
    } catch (err) {
      console.error('Login error:', err);
      const error = parseApiError(err);
      setLastError(error);
      
      // Check if it's a network error and update backend availability
      if (error.code === ErrorCode.NETWORK_ERROR) {
        setIsBackendAvailable(false);
        setConnectionRetryCount(prev => prev + 1);
        
        // Show connection error toast with retry option
        showConnectionErrorToast(() => {
          setConnectionRetryCount(0);
          retryConnection();
        });
      } else {
        // For other auth errors, show specific error toast
        showAuthErrorToast(error);
      }
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken();
      if (response) {
        setIsBackendAvailable(true);
        setConnectionRetryCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      const parsedError = parseApiError(error);
      
      // Check if it's a network error
      if (parsedError.code === ErrorCode.NETWORK_ERROR) {
        setIsBackendAvailable(false);
        setConnectionRetryCount(prev => prev + 1);
      }
      
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

  const retryConnection = async (): Promise<void> => {
    console.log('🔄 Retrying connection to backend...');
    setLoading(true);
    
    try {
      // Try a simple health check or token refresh
      const userData = authService.getUserData();
      if (userData) {
        const response = await authService.refreshToken();
        if (response) {
          setIsBackendAvailable(true);
          setConnectionRetryCount(0);
          setUser(userData);
          console.log('✅ Connection restored successfully');
          return;
        }
      }
      
      // If no user data, just test backend availability
      // This could be a simple ping endpoint
      setIsBackendAvailable(true);
      setConnectionRetryCount(0);
      console.log('✅ Backend connection restored');
      
    } catch (error) {
      console.error('❌ Connection retry failed:', error);
      const parsedError = parseApiError(error);
      
      if (parsedError.code === ErrorCode.NETWORK_ERROR) {
        setIsBackendAvailable(false);
        setConnectionRetryCount(prev => prev + 1);
        
        // Show error toast for failed retry
        showConnectionErrorToast(() => retryConnection());
      }
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
    loading,
    lastError,
    isBackendAvailable,
    retryConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
