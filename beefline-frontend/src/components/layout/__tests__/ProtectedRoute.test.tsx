import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import type { User } from '../../../types';
import * as AuthContext from '../../../contexts/AuthContext';

vi.mock('../../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const renderProtectedRoute = (
  user: User | null = null,
  isLoading = false,
  requireSeller = false
) => {
  vi.mocked(AuthContext.useAuth).mockReturnValue({
    user,
    isAuthenticated: !!user,
    isLoading,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
    clearError: vi.fn(),
  });

  return render(
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute requireSeller={requireSeller}>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when authentication is loading', () => {
      renderProtectedRoute(null, true);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login when user is not authenticated', () => {
      renderProtectedRoute(null, false);

      // Should not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated Access', () => {
    it('should render protected content when user is authenticated', () => {
      const user: User = {
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

      renderProtectedRoute(user, false);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Seller-Only Routes', () => {
    it('should allow seller to access seller-only route', () => {
      const seller: User = {
        id: '1',
        email: 'seller@example.com',
        firstName: 'Jane',
        lastName: 'Seller',
        phoneNumber: '+233201234567',
        region: 'Ashanti',
        userType: 'seller',
        isVerified: true,
        createdAt: new Date(),
      };

      renderProtectedRoute(seller, false, true);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should show access denied for buyer on seller-only route', () => {
      const buyer: User = {
        id: '1',
        email: 'buyer@example.com',
        firstName: 'John',
        lastName: 'Buyer',
        phoneNumber: '+233201234567',
        region: 'Greater Accra',
        userType: 'buyer',
        isVerified: false,
        createdAt: new Date(),
      };

      renderProtectedRoute(buyer, false, true);

      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(screen.getByText(/only accessible to registered sellers/i)).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should not show protected content for buyer on seller-only route', () => {
      const buyer: User = {
        id: '1',
        email: 'buyer@example.com',
        firstName: 'John',
        lastName: 'Buyer',
        phoneNumber: '+233201234567',
        region: 'Greater Accra',
        userType: 'buyer',
        isVerified: false,
        createdAt: new Date(),
      };

      renderProtectedRoute(buyer, false, true);

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('User Type Validation', () => {
    it('should allow any authenticated user when requireSeller is false', () => {
      const buyer: User = {
        id: '1',
        email: 'buyer@example.com',
        firstName: 'John',
        lastName: 'Buyer',
        phoneNumber: '+233201234567',
        region: 'Greater Accra',
        userType: 'buyer',
        isVerified: false,
        createdAt: new Date(),
      };

      renderProtectedRoute(buyer, false, false);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
});
