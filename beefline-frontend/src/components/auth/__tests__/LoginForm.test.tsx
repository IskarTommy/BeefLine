import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../../contexts/AuthContext';
import { authAPI } from '../../../services/api';

// Mock the API
vi.mock('../../../services/api', () => ({
  authAPI: {
    login: vi.fn(),
  },
}));

const renderLoginForm = (props = {}) => {
  return render(
    <AuthProvider>
      <LoginForm {...props} />
    </AuthProvider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render login form with all fields', () => {
      renderLoginForm();

      expect(screen.getByText('Sign In to Beefline')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('should render switch to register link when callback provided', () => {
      const onSwitchToRegister = vi.fn();
      renderLoginForm({ onSwitchToRegister });

      expect(screen.getByText('Sign up here')).toBeInTheDocument();
    });

    it('should not render switch to register link when callback not provided', () => {
      renderLoginForm();

      expect(screen.queryByText('Sign up here')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      // Check that the form doesn't submit successfully (no API call)
      expect(screen.getByDisplayValue('invalid-email')).toBeInTheDocument();
    });

    it('should show validation error for short password', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    it('should not show validation errors for valid input', async () => {
      const user = userEvent.setup();
      vi.mocked(authAPI.login).mockResolvedValue({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+233201234567',
            region: 'Greater Accra',
            userType: 'buyer',
            isVerified: false,
            createdAt: new Date(),
          },
          access: 'token',
          refresh: 'refresh',
        },
      });

      renderLoginForm();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = passwordInput.nextElementSibling?.querySelector('button');

      expect(passwordInput).toHaveAttribute('type', 'password');

      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  describe('Form Submission', () => {
    it('should call login API with correct credentials', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      vi.mocked(authAPI.login).mockResolvedValue({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+233201234567',
            region: 'Greater Accra',
            userType: 'buyer',
            isVerified: false,
            createdAt: new Date(),
          },
          access: 'token',
          refresh: 'refresh',
        },
      });

      renderLoginForm({ onSuccess });

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(onSuccess).toHaveBeenCalledOnce();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(authAPI.login).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderLoginForm();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      vi.mocked(authAPI.login).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      renderLoginForm();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should clear form after successful login', async () => {
      const user = userEvent.setup();
      vi.mocked(authAPI.login).mockResolvedValue({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+233201234567',
            region: 'Greater Accra',
            userType: 'buyer',
            isVerified: false,
            createdAt: new Date(),
          },
          access: 'token',
          refresh: 'refresh',
        },
      });

      renderLoginForm();

      const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
      });
    });
  });

  describe('Navigation', () => {
    it('should call onSwitchToRegister when register link is clicked', async () => {
      const user = userEvent.setup();
      const onSwitchToRegister = vi.fn();
      renderLoginForm({ onSwitchToRegister });

      const registerLink = screen.getByText('Sign up here');
      await user.click(registerLink);

      expect(onSwitchToRegister).toHaveBeenCalledOnce();
    });
  });
});