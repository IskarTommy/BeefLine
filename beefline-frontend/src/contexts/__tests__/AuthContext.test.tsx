import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import { authAPI, userAPI } from '../../services/api';
import type { User } from '../../types';

// Mock the API modules
vi.mock('../../services/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
  userAPI: {
    getProfile: vi.fn(),
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, error, login, logout, register, clearError } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => register({
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+233201234567',
        region: 'Greater Accra',
        userType: 'buyer'
      })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+233201234567',
    region: 'Greater Accra',
    userType: 'buyer',
    isVerified: false,
    createdAt: new Date(),
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with no user and not authenticated', async () => {
      renderWithAuthProvider();
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });

    it('should validate existing token on initialization', async () => {
      localStorage.setItem('authToken', 'valid-token');
      vi.mocked(userAPI.getProfile).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      renderWithAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(userAPI.getProfile).toHaveBeenCalledOnce();
    });

    it('should clear invalid token on initialization', async () => {
      localStorage.setItem('authToken', 'invalid-token');
      localStorage.setItem('refreshToken', 'invalid-refresh');
      vi.mocked(userAPI.getProfile).mockRejectedValue(new Error('Unauthorized'));

      renderWithAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(authAPI.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          access: 'access-token',
          refresh: 'refresh-token',
        },
      });

      renderWithAuthProvider();

      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(localStorage.getItem('authToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      vi.mocked(authAPI.login).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      renderWithAuthProvider();

      try {
        await user.click(screen.getByText('Login'));
      } catch (error) {
        // Expected error from login failure
      }

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('Register', () => {
    it('should register successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(authAPI.register).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          access: 'access-token',
          refresh: 'refresh-token',
        },
      });

      renderWithAuthProvider();

      await user.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(localStorage.getItem('authToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
      expect(authAPI.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+233201234567',
        region: 'Greater Accra',
        userType: 'buyer',
      });
    });

    it('should handle registration failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      vi.mocked(authAPI.register).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      renderWithAuthProvider();

      try {
        await user.click(screen.getByText('Register'));
      } catch (error) {
        // Expected error from registration failure
      }

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const user = userEvent.setup();
      localStorage.setItem('authToken', 'access-token');
      localStorage.setItem('refreshToken', 'refresh-token');
      vi.mocked(authAPI.logout).mockResolvedValue({ success: true, data: null });

      renderWithAuthProvider();

      // Set initial authenticated state
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(authAPI.logout).toHaveBeenCalledOnce();
    });

    it('should logout even if API call fails', async () => {
      const user = userEvent.setup();
      localStorage.setItem('authToken', 'access-token');
      localStorage.setItem('refreshToken', 'refresh-token');
      vi.mocked(authAPI.logout).mockRejectedValue(new Error('Network error'));

      renderWithAuthProvider();

      await user.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear error when clearError is called', async () => {
      const user = userEvent.setup();
      vi.mocked(authAPI.login).mockRejectedValue({
        response: { data: { message: 'Login failed' } },
      });

      renderWithAuthProvider();

      // Trigger an error
      try {
        await user.click(screen.getByText('Login'));
      } catch (error) {
        // Expected error from login failure
      }
      
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
      });

      // Clear the error
      await user.click(screen.getByText('Clear Error'));
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });
  });
});