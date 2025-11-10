import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../Header';
import type { User } from '../../../types';
import * as AuthContext from '../../../contexts/AuthContext';

vi.mock('../../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const renderHeader = (user: User | null = null) => {
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
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Navigation', () => {
    it('should render logo and navigation links', () => {
      renderHeader();

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse cattle/i })).toBeInTheDocument();
    });

    it('should show login and register buttons when not authenticated', () => {
      renderHeader();

      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });

    it('should show profile and logout when authenticated', () => {
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

      renderHeader(user);

      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should show dashboard link for sellers', () => {
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

      renderHeader(seller);

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should not show dashboard link for buyers', () => {
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

      renderHeader(buyer);

      expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should toggle mobile menu when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(menuButton);

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      });

      const mobileMenu = screen.getByRole('dialog', { name: /mobile menu/i });
      expect(mobileMenu).toBeInTheDocument();
    });

    it('should close mobile menu when close button is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      const closeButton = screen.getByRole('button', { name: /close menu/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should close mobile menu when navigation link is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByRole('dialog', { name: /mobile menu/i });
      const homeLink = mobileMenu.querySelector('a[href="/"]');
      
      if (homeLink) {
        await user.click(homeLink);

        await waitFor(() => {
          expect(menuButton).toHaveAttribute('aria-expanded', 'false');
        });
      }
    });

    it('should have touch-friendly targets in mobile menu', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByRole('dialog', { name: /mobile menu/i });
      const touchTargets = mobileMenu.querySelectorAll('.touch-target');

      expect(touchTargets.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('should toggle search bar when search button is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide desktop navigation on mobile', () => {
      renderHeader();

      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('should show mobile menu button on mobile', () => {
      renderHeader();

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toHaveClass('md:hidden');
    });
  });
});
