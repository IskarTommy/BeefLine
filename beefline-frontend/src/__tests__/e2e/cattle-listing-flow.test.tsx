import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import DashboardPage from '../../pages/DashboardPage';
import { cattleAPI, userAPI } from '../../services/api';
import type { User, Cattle } from '../../types';

// Mock API
vi.mock('../../services/api', () => ({
  cattleAPI: {
    createCattle: vi.fn(),
    uploadCattleImages: vi.fn(),
  },
  userAPI: {
    getUserCattle: vi.fn(),
  },
}));

const mockUser: User = {
  id: '1',
  email: 'seller@test.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+233123456789',
  region: 'Ashanti',
  userType: 'seller',
  isVerified: true,
  createdAt: new Date(),
};

const mockCattle: Cattle = {
  id: '1',
  breed: 'West African Shorthorn',
  age: 36,
  weight: 500,
  price: 6000,
  healthNotes: 'Excellent health',
  vaccinationStatus: true,
  feedingHistory: 'Grass and grain',
  region: 'Ashanti',
  images: [],
  healthCertificates: [],
  seller: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

describe('E2E: Cattle Listing Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock user cattle fetch
    vi.mocked(userAPI.getUserCattle).mockResolvedValue({
      success: true,
      data: [],
      message: 'Cattle fetched successfully',
    });
  });

  it('should create a new cattle listing', async () => {
    const user = userEvent.setup();
    
    // Mock successful cattle creation
    vi.mocked(cattleAPI.createCattle).mockResolvedValue({
      success: true,
      data: mockCattle,
      message: 'Cattle created successfully',
    });

    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <DashboardPage />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Click "Add New Cattle" button
    const addButton = await screen.findByRole('button', { name: /add new cattle/i });
    await user.click(addButton);

    // Fill in cattle form
    const breedSelect = screen.getByLabelText(/breed/i);
    await user.selectOptions(breedSelect, 'West African Shorthorn');

    await user.type(screen.getByLabelText(/age.*months/i), '36');
    await user.type(screen.getByLabelText(/weight/i), '500');
    await user.type(screen.getByLabelText(/price/i), '6000');
    await user.type(screen.getByLabelText(/health notes/i), 'Excellent health');
    await user.type(screen.getByLabelText(/feeding history/i), 'Grass and grain');

    // Check vaccination status
    const vaccinatedCheckbox = screen.getByLabelText(/vaccinated/i);
    await user.click(vaccinatedCheckbox);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Verify API was called
    await waitFor(() => {
      expect(cattleAPI.createCattle).toHaveBeenCalledWith(
        expect.objectContaining({
          breed: 'West African Shorthorn',
          age: 36,
          weight: 500,
          price: 6000,
          vaccinationStatus: true,
        })
      );
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <DashboardPage />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Click "Add New Cattle" button
    const addButton = await screen.findByRole('button', { name: /add new cattle/i });
    await user.click(addButton);

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/breed is required/i)).toBeInTheDocument();
      expect(screen.getByText(/age is required/i)).toBeInTheDocument();
      expect(screen.getByText(/weight is required/i)).toBeInTheDocument();
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
    });
  });
});
