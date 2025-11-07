import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CowCard } from '../CowCard';
import type { Cattle } from '../../../types';

const mockCattle: Cattle = {
  id: '1',
  breed: 'West African Shorthorn',
  age: 24,
  weight: 350,
  price: 2500,
  healthNotes: 'Healthy cattle with regular checkups',
  vaccinationStatus: true,
  feedingHistory: 'Grass-fed with supplements',
  region: 'Greater Accra',
  images: [
    {
      id: '1',
      url: 'https://example.com/cattle1.jpg',
      caption: 'Front view',
      isPrimary: true,
    },
    {
      id: '2',
      url: 'https://example.com/cattle2.jpg',
      caption: 'Side view',
      isPrimary: false,
    },
  ],
  healthCertificates: [],
  seller: {
    id: '1',
    email: 'seller@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+233201234567',
    region: 'Greater Accra',
    userType: 'seller',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  isActive: true,
};

const mockCattleWithoutImages: Cattle = {
  ...mockCattle,
  images: [],
  seller: {
    ...mockCattle.seller,
    isVerified: false,
  },
  vaccinationStatus: false,
};

describe('CowCard', () => {
  describe('Rendering', () => {
    it('should render cattle information correctly', () => {
      render(<CowCard cattle={mockCattle} />);

      expect(screen.getByText('West African Shorthorn')).toBeInTheDocument();
      expect(screen.getByText('GH₵2,500')).toBeInTheDocument();
      expect(screen.getByText('2 years')).toBeInTheDocument();
      expect(screen.getByText('350 kg')).toBeInTheDocument();
      expect(screen.getByText('Greater Accra')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display primary image when available', () => {
      render(<CowCard cattle={mockCattle} />);

      const image = screen.getByAltText('West African Shorthorn cattle');
      expect(image).toHaveAttribute('src', 'https://example.com/cattle1.jpg');
    });

    it('should display placeholder image when no images available', () => {
      render(<CowCard cattle={mockCattleWithoutImages} />);

      const image = screen.getByAltText('West African Shorthorn cattle');
      expect(image).toHaveAttribute('src', '/api/placeholder/300/200');
    });

    it('should show vaccination badge when cattle is vaccinated', () => {
      render(<CowCard cattle={mockCattle} />);

      expect(screen.getByText('Vaccinated')).toBeInTheDocument();
    });

    it('should not show vaccination badge when cattle is not vaccinated', () => {
      render(<CowCard cattle={mockCattleWithoutImages} />);

      expect(screen.queryByText('Vaccinated')).not.toBeInTheDocument();
    });

    it('should show verified seller badge when seller is verified', () => {
      render(<CowCard cattle={mockCattle} />);

      expect(screen.getByText('Verified Seller')).toBeInTheDocument();
    });

    it('should not show verified seller badge when seller is not verified', () => {
      render(<CowCard cattle={mockCattleWithoutImages} />);

      expect(screen.queryByText('Verified Seller')).not.toBeInTheDocument();
    });

    it('should format age correctly for months', () => {
      const youngCattle = { ...mockCattle, age: 8 };
      render(<CowCard cattle={youngCattle} />);

      expect(screen.getByText('8 months')).toBeInTheDocument();
    });

    it('should format age correctly for years and months', () => {
      const cattleWithMonths = { ...mockCattle, age: 30 };
      render(<CowCard cattle={cattleWithMonths} />);

      expect(screen.getByText('2y 6m')).toBeInTheDocument();
    });

    it('should display creation date', () => {
      render(<CowCard cattle={mockCattle} />);

      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<CowCard cattle={mockCattle} onClick={onClick} />);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(onClick).toHaveBeenCalledWith(mockCattle);
    });

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<CowCard cattle={mockCattle} onClick={onClick} />);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledWith(mockCattle);
    });

    it('should call onClick when Space key is pressed', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<CowCard cattle={mockCattle} onClick={onClick} />);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledWith(mockCattle);
    });

    it('should not call onClick when no handler provided', async () => {
      const user = userEvent.setup();
      render(<CowCard cattle={mockCattle} />);

      const card = screen.getByRole('button');
      await user.click(card);

      // Should not throw error
      expect(card).toBeInTheDocument();
    });
  });

  describe('Image Error Handling', () => {
    it('should fallback to placeholder when image fails to load', () => {
      render(<CowCard cattle={mockCattle} />);

      const image = screen.getByAltText('West African Shorthorn cattle');
      
      // Simulate image load error
      const errorEvent = new Event('error');
      image.dispatchEvent(errorEvent);

      expect(image).toHaveAttribute('src', '/api/placeholder/300/200');
    });
  });
});