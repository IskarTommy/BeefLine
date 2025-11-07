import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginFormData, RegisterFormData } from '../types';
import { authAPI, userAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Validate token by fetching user profile
          const response = await userAPI.getProfile();
          if (response.success) {
            setUser(response.data);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (error) {
          // Token is invalid or expired, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user: userData, access, refresh } = response.data;
        
        // Store tokens
        localStorage.setItem('authToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        // Set user state
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Call logout API to invalidate token on server
      await authAPI.logout();
    } catch (error) {
      // Even if logout API fails, we should still clear local state
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user: newUser, access, refresh } = response.data;
        
        // Store tokens
        localStorage.setItem('authToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        // Set user state
        setUser(newUser);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};