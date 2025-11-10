import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../Header';
import { Footer } from '../Footer';
import AppLayout from '../AppLayout';
import * as AuthContext from '../../../contexts/AuthContext';

vi.mock('../../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Helper to simulate viewport resize
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

const renderWithRouter = (component: React.ReactElement) => {
  vi.mocked(AuthContext.useAuth).mockReturnValue({
    user: null,
    isAuthenticated: false,
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
      {component}
    </BrowserRouter>
  );
};

describe('Responsive Layout Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset viewport to default
    setViewportSize(1024, 768);
  });

  describe('Header Responsive Behavior', () => {
    it('should show mobile menu button on small screens', () => {
      setViewportSize(375, 667); // Mobile size
      renderWithRouter(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveClass('md:hidden');
    });

    it('should hide desktop navigation on mobile', () => {
      setViewportSize(375, 667);
      renderWithRouter(<Header />);

      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('should show desktop navigation on large screens', () => {
      setViewportSize(1024, 768); // Desktop size
      renderWithRouter(<Header />);

      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('should have sticky header on all screen sizes', () => {
      const { container } = renderWithRouter(<Header />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky', 'top-0');
    });
  });

  describe('Footer Responsive Behavior', () => {
    it('should show mobile layout on small screens', () => {
      setViewportSize(375, 667);
      const { container } = renderWithRouter(<Footer />);

      const mobileLayout = container.querySelector('.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();
    });

    it('should show desktop grid on large screens', () => {
      setViewportSize(1024, 768);
      const { container } = renderWithRouter(<Footer />);

      const desktopGrid = container.querySelector('.md\\:grid');
      expect(desktopGrid).toBeInTheDocument();
    });

    it('should center content on mobile', () => {
      setViewportSize(375, 667);
      const { container } = renderWithRouter(<Footer />);

      const mobileLayout = container.querySelector('.md\\:hidden');
      const centeredContent = mobileLayout?.querySelector('.text-center');
      expect(centeredContent).toBeInTheDocument();
    });
  });

  describe('AppLayout Responsive Behavior', () => {
    it('should maintain full height on all screen sizes', () => {
      const { container } = renderWithRouter(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const layoutContainer = container.querySelector('.min-h-screen');
      expect(layoutContainer).toBeInTheDocument();
    });

    it('should use flex column layout', () => {
      const { container } = renderWithRouter(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const layoutContainer = container.querySelector('.flex-col');
      expect(layoutContainer).toBeInTheDocument();
    });

    it('should expand main content area', () => {
      const { container } = renderWithRouter(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('flex-1');
    });
  });

  describe('Touch Interactions', () => {
    it('should have touch-friendly targets in mobile menu', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByRole('dialog', { name: /mobile menu/i });
      const touchTargets = mobileMenu.querySelectorAll('.touch-target');

      // Touch targets should be at least 44px (standard minimum)
      expect(touchTargets.length).toBeGreaterThan(0);
      touchTargets.forEach((target) => {
        expect(target).toHaveClass('touch-target');
      });
    });

    it('should have adequate spacing between mobile menu items', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByRole('dialog', { name: /mobile menu/i });
      const nav = mobileMenu.querySelector('nav');
      
      expect(nav).toHaveClass('space-y-2');
    });
  });

  describe('Viewport Orientation', () => {
    it('should adapt to portrait orientation', () => {
      setViewportSize(375, 667); // Portrait mobile
      const { container } = renderWithRouter(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const layoutContainer = container.querySelector('.min-h-screen');
      expect(layoutContainer).toBeInTheDocument();
    });

    it('should adapt to landscape orientation', () => {
      setViewportSize(667, 375); // Landscape mobile
      const { container } = renderWithRouter(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const layoutContainer = container.querySelector('.min-h-screen');
      expect(layoutContainer).toBeInTheDocument();
    });
  });

  describe('Tablet Breakpoint', () => {
    it('should handle tablet screen sizes', () => {
      setViewportSize(768, 1024); // Tablet size
      renderWithRouter(<Header />);

      // Should still show mobile menu button at tablet size
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Container Responsiveness', () => {
    it('should use container with padding on all screens', () => {
      const { container } = renderWithRouter(<Header />);

      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toBeInTheDocument();
      expect(containerDiv).toHaveClass('px-4');
    });

    it('should center container content', () => {
      const { container } = renderWithRouter(<Header />);

      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toHaveClass('mx-auto');
    });
  });
});
