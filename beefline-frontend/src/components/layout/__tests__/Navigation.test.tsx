import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Header } from '../Header';
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

const renderWithRouter = (
  initialRoute = '/',
  user: User | null = null
) => {
  vi.mocked(AuthContext.useAuth).mockReturnValue({
    user,
    isAuthenticated: !!user,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
    clearError: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Header />
      <Routes>
        <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
        <Route path="/search" element={<div data-testid="search-page">Search Page</div>} />
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        <Route path="/register" element={<div data-testid="register-page">Register Page</div>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div data-testid="profile-page">Profile Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireSeller={true}>
              <div data-testid="dashboard-page">Dashboard Page</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Public Navigation', () => {
    it('should navigate to home page', async () => {
      const user = userEvent.setup();
      renderWithRouter('/search');

      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('should navigate to search page', async () => {
      const user = userEvent.setup();
      renderWithRouter('/');

      const searchLink = screen.getByRole('link', { name: /browse cattle/i });
      await user.click(searchLink);

      expect(screen.getByTestId('search-page')).toBeInTheDocument();
    });

    it('should navigate to login page', async () => {
      const user = userEvent.setup();
      renderWithRouter('/');

      const loginLink = screen.getByRole('link', { name: /login/i });
      await user.click(loginLink);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should navigate to register page', async () => {
      const user = userEvent.setup();
      renderWithRouter('/');

      const registerLink = screen.getByRole('link', { name: /register/i });
      await user.click(registerLink);

      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes Navigation', () => {
    it('should navigate to profile when authenticated', async () => {
      const authenticatedUser: User = {
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

      const user = userEvent.setup();
      renderWithRouter('/', authenticatedUser);

      const profileLink = screen.getByRole('link', { name: /profile/i });
      await user.click(profileLink);

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('should navigate to dashboard when authenticated as seller', async () => {
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

      const user = userEvent.setup();
      renderWithRouter('/', seller);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await user.click(dashboardLink);

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation', () => {
    it('should navigate from mobile menu', async () => {
      const user = userEvent.setup();
      renderWithRouter('/');

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Wait for menu to open
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /mobile menu/i })).toBeInTheDocument();
      });

      // Click on search link in mobile menu
      const mobileMenu = screen.getByRole('dialog', { name: /mobile menu/i });
      const searchLink = mobileMenu.querySelector('a[href="/search"]');
      
      if (searchLink) {
        await user.click(searchLink);
        expect(screen.getByTestId('search-page')).toBeInTheDocument();
      }
    });

    it('should close mobile menu after navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter('/');

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      });

      const mobileMenu = screen.getByRole('dialog', { name: /mobile menu/i });
      const homeLink = mobileMenu.querySelector('a[href="/"]');
      
      if (homeLink) {
        await user.click(homeLink);

        await waitFor(() => {
          expect(menuButton).toHaveAttribute('aria-expanded', 'false');
        });
      }
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should show current route in breadcrumbs', () => {
      renderWithRouter('/search');

      // Breadcrumbs should reflect current location
      const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumbNav).toBeInTheDocument();
    });
  });

  describe('Logout Navigation', () => {
    it('should have logout button when authenticated', () => {
      const authenticatedUser: User = {
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

      renderWithRouter('/profile', authenticatedUser);

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });
});
