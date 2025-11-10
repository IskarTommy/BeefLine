import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SellerDashboard } from '../SellerDashboard';
import { AuthProvider } from '../../../contexts/AuthContext';
import { userAPI, cattleAPI } from '../../../services/api';
import type { User, Cattle } from '../../../types';

// Mock the API modules
vi.mock('../../../services/api', () => ({
  userAPI: {
    getUserCattle: vi.fn(),
  },
  cattleAPI: {
    createCattle: vi.fn(),
    updateCattle: vi.fn(),
    deleteCattle: vi.fn(),
    uploadCattleImages: vi.fn(),
  },
}));

const mockSeller: User = {
  id: '1',
  email: 'seller@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+233201234567',
  region: 'Ashanti',
  userType: 'seller',
  isVerified: true,
  createdAt: new Date('2024-01-01'),
};

const mockBuyer: User = {
  id: '2',
  email: 'buyer@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  phoneNumber: '+233207654321',
  region: 'Greater Accra',
  userType: 'buyer',
  isVerified: false,
  createdAt: new Date('2024-01-01'),
};

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
    region: 'Ashanti',
    images: [
      {
        id: '1',
        url: 'https://example.com/cattle1.jpg',
        caption: 'Front view',
        isPrimary: true,
      },
    ],
    healthCertificates: [],
    seller: mockSeller,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
  },
  {
    id: '2',
    breed: 'Zebu',
    age: 18,
    weight: 300,
    price: 2000,
    healthNotes: 'Good condition',
    vaccinationStatus: false,
    feedingHistory: 'Mixed feed',
    region: 'Ashanti',
    images: [],
    healthCertificates: [],
    seller: mockSeller,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    isActive: false,
  },
];

// Mock AuthContext
const MockAuthProvider = ({ children, user }: { children: React.ReactNode; user: User | null }) => {
  const mockAuthValue = {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    clearError: vi.fn(),
  };

  return (
    <AuthProvider value={mockAuthValue}>
      {children}
    </AuthProvider>
  );
};

const renderWithProviders = (user: User | null = mockSeller) => {
  return render(
    <BrowserRouter>
      <MockAuthProvider user={user}>
        <SellerDashboard />
      </MockAuthProvider>
    </BrowserRouter>
  );
};

describe('SellerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (userAPI.getUserCattle as any).mockResolvedValue({
      success: true,
      data: mockCattle,
    });
  });

  describe('Access Control', () => {
    it('should deny access to non-sellers', () => {
      renderWithProviders(mockBuyer);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Only sellers can access this dashboard.')).toBeInTheDocument();
    });

    it('should deny access to unauthenticated users', () => {
      renderWithProviders(null);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Only sellers can access this dashboard.')).toBeInTheDocument();
    });

    it('should allow access to sellers', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Manage your cattle listings')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Header', () => {
    it('should display dashboard title and add button', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Manage your cattle listings')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add new cattle/i })).toBeInTheDocument();
      });
    });

    it('should show add form when add button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new cattle/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new cattle/i });
      await user.click(addButton);

      expect(screen.getByText('Add New Cattle')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should display correct statistics', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('Total Listings')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Total cattle count
        
        expect(screen.getByText('Active Listings')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Active cattle count
        
        expect(screen.getByText('Inactive Listings')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Inactive cattle count
        
        expect(screen.getByText('Total Value')).toBeInTheDocument();
        expect(screen.getByText('GH₵4,500')).toBeInTheDocument(); // Total price
      });
    });
  });

  describe('Cattle List', () => {
    it('should display cattle listings in table format', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('West African Shorthorn')).toBeInTheDocument();
        expect(screen.getByText('Zebu')).toBeInTheDocument();
        expect(screen.getByText('24 months • 350 kg')).toBeInTheDocument();
        expect(screen.getByText('18 months • 300 kg')).toBeInTheDocument();
        expect(screen.getByText('GH₵2,500')).toBeInTheDocument();
        expect(screen.getByText('GH₵2,000')).toBeInTheDocument();
      });
    });

    it('should show vaccination status correctly', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('✓ Vaccinated')).toBeInTheDocument();
        expect(screen.getByText('✗ Not vaccinated')).toBeInTheDocument();
      });
    });

    it('should display cattle images or placeholder', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        const images = screen.getAllByAltText(/cattle/i);
        expect(images).toHaveLength(2);
        
        // First cattle has image
        expect(images[0]).toHaveAttribute('src', 'https://example.com/cattle1.jpg');
        
        // Second cattle should show placeholder (no images)
        // This would be handled by the component's placeholder logic
      });
    });

    it('should show active/inactive status buttons', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        const activeButton = screen.getByRole('button', { name: /active/i });
        const inactiveButton = screen.getByRole('button', { name: /inactive/i });
        
        expect(activeButton).toBeInTheDocument();
        expect(inactiveButton).toBeInTheDocument();
      });
    });
  });

  describe('Cattle Actions', () => {
    it('should show action buttons for each cattle', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        const viewLinks = screen.getAllByText('View');
        const editButtons = screen.getAllByText('Edit');
        const deleteButtons = screen.getAllByText('Delete');
        
        expect(viewLinks).toHaveLength(2);
        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });

    it('should toggle cattle status when status button is clicked', async () => {
      const user = userEvent.setup();
      (cattleAPI.updateCattle as any).mockResolvedValue({
        success: true,
        data: { ...mockCattle[0], isActive: false },
      });

      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
      });

      const activeButton = screen.getByRole('button', { name: /active/i });
      await user.click(activeButton);

      expect(cattleAPI.updateCattle).toHaveBeenCalledWith('1', { isActive: false });
    });

    it('should show edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getAllByText('Edit')).toHaveLength(2);
      });

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(screen.getByText('Edit Cattle')).toBeInTheDocument();
    });

    it('should confirm before deleting cattle', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      (cattleAPI.deleteCattle as any).mockResolvedValue({ success: true });

      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getAllByText('Delete')).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this cattle listing?');
      expect(cattleAPI.deleteCattle).toHaveBeenCalledWith('1');

      confirmSpy.mockRestore();
    });

    it('should not delete cattle if user cancels confirmation', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getAllByText('Delete')).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(cattleAPI.deleteCattle).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no cattle listings exist', async () => {
      (userAPI.getUserCattle as any).mockResolvedValue({
        success: true,
        data: [],
      });

      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('No cattle listings')).toBeInTheDocument();
        expect(screen.getByText('Get started by adding your first cattle listing.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add cattle/i })).toBeInTheDocument();
      });
    });

    it('should show add form from empty state button', async () => {
      const user = userEvent.setup();
      (userAPI.getUserCattle as any).mockResolvedValue({
        success: true,
        data: [],
      });

      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add cattle/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add cattle/i });
      await user.click(addButton);

      expect(screen.getByText('Add New Cattle')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state while fetching cattle', () => {
      (userAPI.getUserCattle as any).mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(mockSeller);

      expect(screen.getByText('Loading your cattle listings...')).toBeInTheDocument();
    });

    it('should show error message when API call fails', async () => {
      (userAPI.getUserCattle as any).mockRejectedValue(new Error('API Error'));

      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    it('should show error message when API returns unsuccessful response', async () => {
      (userAPI.getUserCattle as any).mockResolvedValue({
        success: false,
        data: [],
      });

      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('Failed to load cattle listings')).toBeInTheDocument();
      });
    });
  });

  describe('Date and Price Formatting', () => {
    it('should format dates correctly', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
        expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument();
      });
    });

    it('should format prices in Ghana Cedis', async () => {
      renderWithProviders(mockSeller);

      await waitFor(() => {
        expect(screen.getByText('GH₵2,500')).toBeInTheDocument();
        expect(screen.getByText('GH₵2,000')).toBeInTheDocument();
        expect(screen.getByText('GH₵4,500')).toBeInTheDocument(); // Total value
      });
    });
  });
});