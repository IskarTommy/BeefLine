import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../AppLayout';
import * as AuthContext from '../../../contexts/AuthContext';

vi.mock('../../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const renderAppLayout = (children: React.ReactNode) => {
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
      <AppLayout>{children}</AppLayout>
    </BrowserRouter>
  );
};

describe('AppLayout', () => {
  describe('Structure', () => {
    it('should render header, main content, and footer', () => {
      renderAppLayout(<div data-testid="test-content">Test Content</div>);

      // Header should be present (check for logo or navigation)
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // Main content should be rendered
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      // Footer should be present
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should render breadcrumbs', () => {
      const { container } = renderAppLayout(<div>Content</div>);

      // Breadcrumbs component should be rendered
      // Check for breadcrumb navigation structure
      const breadcrumbs = container.querySelector('nav[aria-label="Breadcrumb"]');
      expect(breadcrumbs).toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      const { container } = renderAppLayout(<div>Content</div>);

      const layoutContainer = container.querySelector('.min-h-screen');
      expect(layoutContainer).toBeInTheDocument();
      expect(layoutContainer).toHaveClass('flex', 'flex-col');
    });

    it('should render main content in flex-1 container', () => {
      const { container } = renderAppLayout(<div>Content</div>);

      const mainElement = container.querySelector('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('flex-1');
    });
  });

  describe('Children Rendering', () => {
    it('should render children content correctly', () => {
      renderAppLayout(
        <div>
          <h1>Page Title</h1>
          <p>Page content goes here</p>
        </div>
      );

      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page content goes here')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      renderAppLayout(
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive background color', () => {
      const { container } = renderAppLayout(<div>Content</div>);

      const layoutContainer = container.querySelector('.bg-gray-50');
      expect(layoutContainer).toBeInTheDocument();
    });

    it('should maintain full viewport height', () => {
      const { container } = renderAppLayout(<div>Content</div>);

      const layoutContainer = container.querySelector('.min-h-screen');
      expect(layoutContainer).toBeInTheDocument();
    });
  });
});
