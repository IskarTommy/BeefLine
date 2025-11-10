import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import RegisterPage from '../../pages/RegisterPage';
import { authAPI } from '../../services/api';

// Mock API
vi.mock('../../services/api', () => ({
  authAPI: {
    register: vi.fn(),
  },
}));

describe('E2E: User Registration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full registration flow for a seller', async () => {
    const user = userEvent.setup();
    
    // Mock successful registration
    vi.mocked(authAPI.register).mockResolvedValue({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'seller@test.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+233123456789',
          region: 'Ashanti',
          userType: 'seller',
          isVerified: false,
          createdAt: new Date(),
        },
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      },
      message: 'Registration successful',
    });

    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <RegisterPage />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Fill in registration form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'seller@test.com');
    await user.type(screen.getByLabelText(/phone/i), '+233123456789');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
    
    // Select region
    const regionSelect = screen.getByLabelText(/region/i);
    await user.selectOptions(regionSelect, 'Ashanti');
    
    // Select user type
    const sellerRadio = screen.getByLabelText(/seller/i);
    await user.click(sellerRadio);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    // Verify API was called with correct data
    await waitFor(() => {
      expect(authAPI.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'seller@test.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+233123456789',
          region: 'Ashanti',
          userType: 'seller',
        })
      );
    });
  });

  it('should show validation errors for invalid input', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <RegisterPage />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
