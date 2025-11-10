import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import SearchPage from '../../pages/SearchPage';
import { cattleAPI } from '../../services/api';
import type { Cattle } from '../../types';

// Mock API
vi.mock('../../services/api', () => ({
  cattleAPI: {
    getCattle: vi.fn(),
  },
}));

const mockCattle: Cattle[] = [
  {
    id: '1',
    breed: 'Zebu',
    age: 24,
    weight: 450,
    price: 5000,
    healthNotes: 'Healthy',
    vaccinationStatus: true,
    feedingHistory: 'Grass-fed',
    region: 'Ashanti',
    images: [
      {
        id: '1',
        url: '/test-image.jpg',
        isPrimary: true,
      },
    ],
    healthCertificates: [],
    seller: {
      id: '1',
      email: 'seller@test.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+233123456789',
      region: 'Ashanti',
      userType: 'seller',
      isVerified: true,
      createdAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
];

describe('E2E: Cattle Search and Filter Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful cattle fetch
    vi.mocked(cattleAPI.getCattle).mockResolvedValue({
      data: mockCattle,
      total: 1,
      page: 1,
      limit: 12,
      totalPages: 1,
    });
  });

  it('should search and filter cattle listings', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <SearchPage />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Wait for initial cattle to load
    await waitFor(() => {
      expect(screen.getByText('Zebu')).toBeInTheDocument();
    });

    // Search for cattle
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'Zebu');

    // Apply breed filter
    const breedFilter = screen.getByLabelText(/zebu/i);
    await user.click(breedFilter);

    // Verify API was called with filters
    await waitFor(() => {
      expect(cattleAPI.getCattle).toHaveBeenCalledWith(
        expect.objectContaining({
          breed: 'Zebu',
        }),
        expect.any(Object),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  it('should display cattle cards with correct information', async () => {
    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <SearchPage />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Wait for cattle to load
    await waitFor(() => {
      expect(screen.getByText('Zebu')).toBeInTheDocument();
    });

    // Verify cattle information is displayed
    expect(screen.getByText('Zebu')).toBeInTheDocument();
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
    expect(screen.getByText(/450 kg/)).toBeInTheDocument();
    expect(screen.getByText(/Ashanti/)).toBeInTheDocument();
    expect(screen.getByText(/Vaccinated/)).toBeInTheDocument();
  });

  it('should handle empty search results', async () => {
    // Mock empty results
    vi.mocked(cattleAPI.getCattle).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    });

    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <SearchPage />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByText(/no cattle found/i)).toBeInTheDocument();
    });
  });
});
