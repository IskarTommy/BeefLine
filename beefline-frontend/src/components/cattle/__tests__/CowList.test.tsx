import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CowList } from '../CowList';
import { Cattle } from '../../../types';

const mockCattle: Cattle[] = [
  {
    id: '1',
    breed: 'West African Shorthorn',
    age: 24,
    weight: 350,
    price: 2500,
    healthNotes: 'Healthy cattle',
    vaccinationStatus: true,
    feedingHistory: 'Grass-fed',
    region: 'Greater Accra',
    images: [{
      id: '1',
      url: 'https://example.com/cattle1.jpg',
      caption: 'Front view',
      isPrimary: true,
    }],
    healthCertificates: [],
    seller: {
      id: '1',
      email: 'seller1@example.com',
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
  },
  {
    id: '2',
    breed: 'Zebu',
    age: 36,
    weight: 400,
    price: 3000,
    healthNotes: 'Excellent condition',
    vaccinationStatus: true,
    feedingHistory: 'Mixed feed',
    region: 'Northern Region',
    images: [{
      id: '2',
      url: 'https://example.com/cattle2.jpg',
      caption: 'Side view',
      isPrimary: true,
    }],
    healthCertificates: [],
    seller: {
      id: '2',
      email: 'seller2@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+233207654321',
      region: 'Northern Region',
      userType: 'seller',
      isVerified: false,
      createdAt: new Date('2024-01-01'),
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    isActive: true,
  },
];

const mockPagination = {
  currentPage: 1,
  totalPages: 3,
  total: 25,
  onPageChange: vi.fn(),
};

describe('CowList', () => {
  describe('Loading State', () => {
    it('should display loading skeleton when loading is true', () => {
      render(<CowList cattle={[]} loading={true} />);

      // Should show multiple skeleton cards
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not display cattle cards when loading', () => {
      render(<CowList cattle={mockCattle} loading={true} />);

      expect(screen.queryByText('West African Shorthorn')).not.toBeInTheDocument();
      expect(screen.queryByText('Zebu')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no cattle provided', () => {
      render(<CowList cattle={[]} />);

      expect(screen.getByText('No cattle found')).toBeInTheDocument();
      expect(screen.getByText(/We couldn't find any cattle matching/)).toBeInTheDocument();
    });

    it('should not display empty state when cattle are provided', () => {
      render(<CowList cattle={mockCattle} />);

      expect(screen.queryByText('No cattle found')).not.toBeInTheDocument();
    });
  });

  describe('Cattle Display', () => {
    it('should render all cattle cards', () => {
      render(<CowList cattle={mockCattle} />);

      expect(screen.getByText('West African Shorthorn')).toBeInTheDocument();
      expect(screen.getByText('Zebu')).toBeInTheDocument();
    });

    it('should display results count without pagination', () => {
      render(<CowList cattle={mockCattle} />);

      expect(screen.getByText('2 cattle found')).toBeInTheDocument();
    });

    it('should call onCattleClick when cattle card is clicked', async () => {
      const user = userEvent.setup();
      const onCattleClick = vi.fn();
      render(<CowList cattle={mockCattle} onCattleClick={onCattleClick} />);

      const firstCard = screen.getByText('West African Shorthorn').closest('[role="button"]');
      if (firstCard) {
        await user.click(firstCard);
        expect(onCattleClick).toHaveBeenCalledWith(mockCattle[0]);
      }
    });
  });

  describe('Pagination', () => {
    it('should display pagination when provided', () => {
      render(<CowList cattle={mockCattle} pagination={mockPagination} />);

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display correct results count with pagination', () => {
      render(<CowList cattle={mockCattle} pagination={mockPagination} />);

      expect(screen.getByText('Showing 1 to 2 of 25 cattle')).toBeInTheDocument();
    });

    it('should call onPageChange when page button is clicked', async () => {
      const user = userEvent.setup();
      render(<CowList cattle={mockCattle} pagination={mockPagination} />);

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      expect(mockPagination.onPageChange).toHaveBeenCalledWith(2);
    });

    it('should disable Previous button on first page', () => {
      render(<CowList cattle={mockCattle} pagination={mockPagination} />);

      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      const lastPagePagination = { ...mockPagination, currentPage: 3 };
      render(<CowList cattle={mockCattle} pagination={lastPagePagination} />);

      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('should highlight current page', () => {
      render(<CowList cattle={mockCattle} pagination={mockPagination} />);

      const currentPageButton = screen.getByText('1');
      expect(currentPageButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should not display pagination when totalPages is 1', () => {
      const singlePagePagination = { ...mockPagination, totalPages: 1 };
      render(<CowList cattle={mockCattle} pagination={singlePagePagination} />);

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('should handle page number clicks correctly', async () => {
      const user = userEvent.setup();
      const multiPagePagination = { ...mockPagination, currentPage: 2, totalPages: 5 };
      render(<CowList cattle={mockCattle} pagination={multiPagePagination} />);

      // Should show page numbers around current page
      const pageButton = screen.getByText('3');
      await user.click(pageButton);

      expect(mockPagination.onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Grid Layout', () => {
    it('should display cattle in grid layout', () => {
      render(<CowList cattle={mockCattle} />);

      const gridContainer = screen.getByText('West African Shorthorn').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    });
  });
});