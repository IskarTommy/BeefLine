import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '../Footer';

const renderFooter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer', () => {
  describe('Rendering', () => {
    it('should render footer with brand information', () => {
      renderFooter();

      expect(screen.getByText(/connecting ghana's cattle market/i)).toBeInTheDocument();
    });

    it('should render current year in copyright', () => {
      renderFooter();

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`${currentYear} Beefline`, 'i'))).toBeInTheDocument();
    });

    it('should render quick links section', () => {
      renderFooter();

      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse cattle/i })).toBeInTheDocument();
    });

    it('should render for sellers section', () => {
      renderFooter();

      expect(screen.getByText('For Sellers')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should render contact information', () => {
      renderFooter();

      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText(/info@beefline.gh/i)).toBeInTheDocument();
      expect(screen.getByText(/\+233/i)).toBeInTheDocument();
    });

    it('should render legal links', () => {
      renderFooter();

      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have desktop grid layout', () => {
      const { container } = renderFooter();

      const desktopGrid = container.querySelector('.md\\:grid');
      expect(desktopGrid).toBeInTheDocument();
    });

    it('should have mobile layout', () => {
      const { container } = renderFooter();

      const mobileLayout = container.querySelector('.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href attributes', () => {
      renderFooter();

      expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /browse cattle/i })).toHaveAttribute('href', '/search');
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    });
  });
});
