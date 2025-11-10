import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../UserProfile';
import { AuthProvider } from '../../../contexts/AuthContext';
import { userAPI } from '../../../services/api';
import type { User } from '../../../types';
import { type ReactNode } from 'react';

// Mock the API
vi.mock('../../../services/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
  userAPI: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    requestVerification: vi.fn(),
  },
}));

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+233123456789',
  region: 'Ashanti',
  userType: 'seller',
  isVerified: false,
  createdAt: new Date('2024-01-01'),
};

// Mock AuthProvider that allows us to control the user state
const MockAuthProvider = ({ children, user }: { children: ReactNode; user: User | null }) => {
  // Mock the getProfile call to return our test user
  vi.mocked(userAPI.getProfile).mockResolvedValue({
    success: true,
    data: user || mockUser,
  });

  return <AuthProvider>{children}</AuthProvider>;
};

const renderWithAuth = (user: User | null = mockUser) => {
  return render(
    <MockAuthProvider user={user}>
      <UserProfile />
    </MockAuthProvider>
  );
};

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Display', () => {
    it('should display user information', () => {
      renderWithAuth();

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('+233123456789')).toBeInTheDocument();
      expect(screen.getByText('Ashanti')).toBeInTheDocument();
    });

    it('should show loading state when user is null', () => {
      renderWithAuth(null);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });
  });

  describe('Profile Editing', () => {
    it('should enable edit mode when Edit Profile button is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should update profile successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(userAPI.updateProfile).mockResolvedValue({
        success: true,
        data: { ...mockUser, firstName: 'Jane' },
      });

      renderWithAuth();

      // Enter edit mode
      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      // Update first name
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');

      // Submit form
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(userAPI.updateProfile).toHaveBeenCalled();
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty required fields', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Change', () => {
    it('should enable password change mode when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changePasswordButton);

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('should change password successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(userAPI.changePassword).mockResolvedValue({
        success: true,
        data: null,
      });

      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /change password/i }));

      await user.type(screen.getByLabelText(/current password/i), 'oldPassword123');
      await user.type(screen.getByLabelText(/new password/i), 'newPassword123');
      await user.type(screen.getByLabelText(/confirm new password/i), 'newPassword123');

      const buttons = screen.getAllByRole('button', { name: /change password/i });
      const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
      if (submitButton) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(userAPI.changePassword).toHaveBeenCalledWith({
          currentPassword: 'oldPassword123',
          newPassword: 'newPassword123',
        });
        expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /change password/i }));

      await user.type(screen.getByLabelText(/current password/i), 'oldPassword123');
      await user.type(screen.getByLabelText(/new password/i), 'newPassword123');
      await user.type(screen.getByLabelText(/confirm new password/i), 'differentPassword');

      const buttons = screen.getAllByRole('button', { name: /change password/i });
      const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
      if (submitButton) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Verification System', () => {
    it('should display verification badge for verified users', () => {
      const verifiedUser = { ...mockUser, isVerified: true };
      renderWithAuth(verifiedUser);

      expect(screen.getByText(/verified seller/i)).toBeInTheDocument();
    });

    it('should show verification request button for unverified sellers', () => {
      renderWithAuth();

      expect(screen.getByRole('button', { name: /request verification/i })).toBeInTheDocument();
    });

    it('should submit verification request successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(userAPI.requestVerification).mockResolvedValue({
        success: true,
        data: null,
      });

      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /request verification/i }));

      await waitFor(() => {
        expect(userAPI.requestVerification).toHaveBeenCalled();
        expect(screen.getByText(/verification request submitted successfully/i)).toBeInTheDocument();
      });
    });
  });
});