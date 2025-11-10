import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CowForm } from '../CowForm';
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
  region: 'Ashanti',
  images: [],
  healthCertificates: [],
  seller: {
    id: '1',
    email: 'seller@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+233201234567',
    region: 'Ashanti',
    userType: 'seller',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  isActive: true,
};

describe('CowForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render form with all required fields', () => {
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/breed/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/age \(months\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/weight \(kg\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price \(ghs\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/vaccination up to date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/health notes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/feeding history/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/active listing/i)).toBeInTheDocument();
    });

    it('should render "Add New Cattle" title when creating new cattle', () => {
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Add New Cattle')).toBeInTheDocument();
      expect(screen.getByText('Provide detailed information about your cattle')).toBeInTheDocument();
    });

    it('should render "Edit Cattle" title when editing existing cattle', () => {
      render(
        <CowForm
          cattle={mockCattle}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Edit Cattle')).toBeInTheDocument();
      expect(screen.getByText('Update your cattle information')).toBeInTheDocument();
    });

    it('should populate form fields when editing existing cattle', () => {
      render(
        <CowForm
          cattle={mockCattle}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('West African Shorthorn')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Ashanti')).toBeInTheDocument();
      expect(screen.getByDisplayValue('24')).toBeInTheDocument();
      expect(screen.getByDisplayValue('350')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2500')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Healthy cattle with regular checkups')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Grass-fed with supplements')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Clear required fields
      const ageInput = screen.getByLabelText(/age \(months\)/i);
      const weightInput = screen.getByLabelText(/weight \(kg\)/i);
      const priceInput = screen.getByLabelText(/price \(ghs\)/i);

      await user.clear(ageInput);
      await user.clear(weightInput);
      await user.clear(priceInput);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add cattle/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Age is required')).toBeInTheDocument();
        expect(screen.getByText('Weight is required')).toBeInTheDocument();
        expect(screen.getByText('Price is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate age range', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const ageInput = screen.getByLabelText(/age \(months\)/i);
      
      // Test minimum age
      await user.clear(ageInput);
      await user.type(ageInput, '0');
      
      const submitButton = screen.getByRole('button', { name: /add cattle/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Age must be at least 1 month')).toBeInTheDocument();
      });

      // Test maximum age
      await user.clear(ageInput);
      await user.type(ageInput, '400');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Age must be less than 300 months')).toBeInTheDocument();
      });
    });

    it('should validate weight range', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const weightInput = screen.getByLabelText(/weight \(kg\)/i);
      
      // Test minimum weight
      await user.clear(weightInput);
      await user.type(weightInput, '30');
      
      const submitButton = screen.getByRole('button', { name: /add cattle/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Weight must be at least 50 kg')).toBeInTheDocument();
      });

      // Test maximum weight
      await user.clear(weightInput);
      await user.type(weightInput, '1200');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Weight must be less than 1000 kg')).toBeInTheDocument();
      });
    });

    it('should validate minimum price', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const priceInput = screen.getByLabelText(/price \(ghs\)/i);
      
      await user.clear(priceInput);
      await user.type(priceInput, '50');
      
      const submitButton = screen.getByRole('button', { name: /add cattle/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Price must be at least 100 GHS')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill form with valid data
      await user.selectOptions(screen.getByLabelText(/breed/i), 'Zebu');
      await user.selectOptions(screen.getByLabelText(/region/i), 'Northern Savannah');
      
      const ageInput = screen.getByLabelText(/age \(months\)/i);
      const weightInput = screen.getByLabelText(/weight \(kg\)/i);
      const priceInput = screen.getByLabelText(/price \(ghs\)/i);
      
      await user.clear(ageInput);
      await user.type(ageInput, '18');
      await user.clear(weightInput);
      await user.type(weightInput, '300');
      await user.clear(priceInput);
      await user.type(priceInput, '2000');

      await user.type(screen.getByLabelText(/health notes/i), 'Good health');
      await user.type(screen.getByLabelText(/feeding history/i), 'Grass fed');
      await user.click(screen.getByLabelText(/vaccination up to date/i));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add cattle/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            breed: 'Zebu',
            region: 'Northern Savannah',
            age: 18,
            weight: 300,
            price: 2000,
            healthNotes: 'Good health',
            feedingHistory: 'Grass fed',
            vaccinationStatus: true,
            isActive: true
          }),
          [], // images
          []  // documents
        );
      });
    });

    it('should handle form submission errors', async () => {
      const user = userEvent.setup();
      const mockOnSubmitWithError = vi.fn().mockRejectedValue(new Error('Submission failed'));
      
      render(
        <CowForm
          onSubmit={mockOnSubmitWithError}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /add cattle/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /saving\.\.\./i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Actions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should disable buttons during submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmitSlow = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      render(
        <CowForm
          onSubmit={mockOnSubmitSlow}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /add cattle/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Breed and Region Options', () => {
    it('should have all breed options available', () => {
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const breedSelect = screen.getByLabelText(/breed/i);
      expect(breedSelect).toHaveValue('West African Shorthorn');
      
      const options = screen.getAllByRole('option');
      const breedOptions = options.filter(option => 
        ['West African Shorthorn', 'Zebu', 'Sanga'].includes(option.textContent || '')
      );
      
      expect(breedOptions).toHaveLength(3);
    });

    it('should have all region options available', () => {
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const regionSelect = screen.getByLabelText(/region/i);
      expect(regionSelect).toHaveValue('Ashanti');
      
      // Check that major regions are available
      expect(screen.getByRole('option', { name: 'Ashanti' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Northern Savannah' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Greater Accra' })).toBeInTheDocument();
    });
  });

  describe('Checkbox Interactions', () => {
    it('should toggle vaccination status', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const vaccinationCheckbox = screen.getByLabelText(/vaccination up to date/i);
      expect(vaccinationCheckbox).not.toBeChecked();

      await user.click(vaccinationCheckbox);
      expect(vaccinationCheckbox).toBeChecked();

      await user.click(vaccinationCheckbox);
      expect(vaccinationCheckbox).not.toBeChecked();
    });

    it('should toggle active status', async () => {
      const user = userEvent.setup();
      render(
        <CowForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const activeCheckbox = screen.getByLabelText(/active listing/i);
      expect(activeCheckbox).toBeChecked(); // Default is true

      await user.click(activeCheckbox);
      expect(activeCheckbox).not.toBeChecked();

      await user.click(activeCheckbox);
      expect(activeCheckbox).toBeChecked();
    });
  });
});