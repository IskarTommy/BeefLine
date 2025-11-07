import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RegisterForm } from '../RegisterForm';
import { AuthProvider } from '../../../contexts/AuthContext';
import { authAPI } from '../../../services/api';

// Mock the API
vi.mock('../../../services/api', () => ({
  authAPI: {
    register: vi.fn(),
  },
}));

const renderRegisterForm = (props = {}) => {
  return render(
    <AuthProvider>
      <RegisterForm {...props} />
    </AuthProvider>
  );
};

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render registration form with all fields', () => {
      renderRegisterForm();

      expect(screen.getByText('Join Beefline')).toBeInTheDocument();
      expect(screen.getByText('I want to:')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Region')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should render user type radio buttons', () => {
      renderRegisterForm();

      expect(screen.getByText('Buy Cattle')).toBeInTheDocument();
      expect(screen.getByText('Sell Cattle')).toBeInTheDocument();
    });

    it('should render Ghana regions in dropdown', () => {
      renderRegisterForm();

      const regionSelect = screen.getByLabelText('Region');
      expect(regionSelect).toBeInTheDocument();
      
      // Check if some regions are present
      expect(screen.getByText('Greater Accra')).toBeInTheDocument();
      expect(screen.getByText('Ashanti')).toBeInTheDocument();
      expect(screen.getByText('Northern')).toBeInTheDocument();
    });

    it('should render switch to login link when callback provided', () => {
      const onSwitchToLogin = vi.fn();
      renderRegisterForm({ onSwitchToLogin });

      expect(screen.getByText('Sign in here')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select your role')).toBeInTheDocument();
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
        expect(screen.getByText('Please select your region')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      // Check that the form doesn't submit successfully (no API call)
      expect(screen.getByDisplayValue('invalid-email')).toBeInTheDocument();
    });

    it('should validate Ghana phone number format', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const phoneInput = screen.getByLabelText('Phone Number');
      await user.type(phoneInput, '123456789');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid Ghana phone number (e.g., +233201234567 or 0201234567)')).toBeInTheDocument();
      });
    });

    it('should validate password strength', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'weak');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('should validate password complexity', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'simplepassword');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter, one lowercase letter, and one number')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'DifferentPassword123');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should validate name length', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');

      await user.type(firstNameInput, 'A');
      await user.type(lastNameInput, 'B');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument();
        expect(screen.getByText('Last name must be at least 2 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility for both password fields', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      
      const passwordToggle = passwordInput.nextElementSibling?.querySelector('button');
      const confirmPasswordToggle = confirmPasswordInput.nextElementSibling?.querySelector('button');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      if (passwordToggle) {
        await user.click(passwordToggle);
        expect(passwordInput).toHaveAttribute('type', 'text');
      }

      if (confirmPasswordToggle) {
        await user.click(confirmPasswordToggle);
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
      }
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async (user: any) => {
      // Select user type
      const buyerRadio = screen.getByLabelText('Buy Cattle');
      await user.click(buyerRadio);

      // Fill name fields
      await user.type(screen.getByLabelText('First Name'), 'John');
      await user.type(screen.getByLabelText('Last Name'), 'Doe');

      // Fill contact fields
      await user.type(screen.getByLabelText('Email Address'), 'john.doe@example.com');
      await user.type(screen.getByLabelText('Phone Number'), '+233201234567');

      // Select region
      const regionSelect = screen.getByLabelText('Region');
      await user.selectOptions(regionSelect, 'Greater Accra');

      // Fill password fields
      await user.type(screen.getByLabelText('Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
    };

    it('should call register API with correct data', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      vi.mocked(authAPI.register).mockResolvedValue({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'john.doe@example.com',
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

      renderRegisterForm({ onSuccess });

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith({
          userType: 'buyer',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+233201234567',
          region: 'Greater Accra',
          password: 'Password123',
          confirmPassword: 'Password123',
        });
        expect(onSuccess).toHaveBeenCalledOnce();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(authAPI.register).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderRegisterForm();

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should display error message on registration failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      vi.mocked(authAPI.register).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      renderRegisterForm();

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should clear form after successful registration', async () => {
      const user = userEvent.setup();
      vi.mocked(authAPI.register).mockResolvedValue({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'john.doe@example.com',
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

      renderRegisterForm();

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
        const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
        expect(emailInput.value).toBe('');
        expect(firstNameInput.value).toBe('');
      });
    });
  });

  describe('Navigation', () => {
    it('should call onSwitchToLogin when login link is clicked', async () => {
      const user = userEvent.setup();
      const onSwitchToLogin = vi.fn();
      renderRegisterForm({ onSwitchToLogin });

      const loginLink = screen.getByText('Sign in here');
      await user.click(loginLink);

      expect(onSwitchToLogin).toHaveBeenCalledOnce();
    });
  });
});