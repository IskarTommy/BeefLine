import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FilterPanel } from '../FilterPanel';
import type { SearchFilters } from '../../../types';

describe('FilterPanel', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnReset = vi.fn();
  const user = userEvent.setup();

  const defaultFilters: SearchFilters = {};
  const activeFilters: SearchFilters = {
    breed: 'Zebu,Sanga',
    region: 'Ashanti',
    minPrice: 1000,
    maxPrice: 5000,
    minAge: 12,
    maxAge: 36,
    vaccinationStatus: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter panel with title', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render all filter sections', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Breed')).toBeInTheDocument();
      expect(screen.getByText('Price Range (GHS)')).toBeInTheDocument();
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('Age Range (months)')).toBeInTheDocument();
      expect(screen.getByText('Weight Range (kg)')).toBeInTheDocument();
      expect(screen.getByText('Health Status')).toBeInTheDocument();
    });

    it('should show clear all button when filters are active', () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should not show clear all button when no filters are active', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });
  });

  describe('Breed Filter', () => {
    it('should render all breed options', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('West African Shorthorn')).toBeInTheDocument();
      expect(screen.getByText('Zebu')).toBeInTheDocument();
      expect(screen.getByText('Sanga')).toBeInTheDocument();
    });

    it('should check selected breeds', () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const zebuCheckbox = screen.getByRole('checkbox', { name: /Zebu/i });
      const sangaCheckbox = screen.getByRole('checkbox', { name: /Sanga/i });
      const shortHornCheckbox = screen.getByRole('checkbox', { name: /West African Shorthorn/i });

      expect(zebuCheckbox).toBeChecked();
      expect(sangaCheckbox).toBeChecked();
      expect(shortHornCheckbox).not.toBeChecked();
    });

    it('should call onFiltersChange when breed is selected', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const zebuCheckbox = screen.getByRole('checkbox', { name: /Zebu/i });
      await user.click(zebuCheckbox);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          breed: 'Zebu'
        });
      });
    });

    it('should handle multiple breed selections', async () => {
      render(
        <FilterPanel
          filters={{ breed: 'Zebu' }}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const sangaCheckbox = screen.getByRole('checkbox', { name: /Sanga/i });
      await user.click(sangaCheckbox);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          breed: 'Zebu,Sanga'
        });
      });
    });

    it('should remove breed when unchecked', async () => {
      render(
        <FilterPanel
          filters={{ breed: 'Zebu,Sanga' }}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const zebuCheckbox = screen.getByRole('checkbox', { name: /Zebu/i });
      await user.click(zebuCheckbox);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          breed: 'Sanga'
        });
      });
    });
  });

  describe('Price Range Filter', () => {
    it('should render price range inputs', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByPlaceholderText('Min price')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max price')).toBeInTheDocument();
    });

    it('should display current price values', () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const minPriceInput = screen.getByPlaceholderText('Min price') as HTMLInputElement;
      const maxPriceInput = screen.getByPlaceholderText('Max price') as HTMLInputElement;

      expect(minPriceInput.value).toBe('1000');
      expect(maxPriceInput.value).toBe('5000');
    });

    it('should call onFiltersChange when price is entered', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const minPriceInput = screen.getByPlaceholderText('Min price');
      await user.type(minPriceInput, '2000');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          minPrice: 2000
        });
      }, { timeout: 1000 });
    });

    it('should render price range slider', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '50000');
    });
  });

  describe('Region Filter', () => {
    it('should render region dropdown', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const regionSelect = screen.getByRole('combobox');
      expect(regionSelect).toBeInTheDocument();
    });

    it('should show selected region', () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const regionSelect = screen.getByRole('combobox') as HTMLSelectElement;
      expect(regionSelect.value).toBe('Ashanti');
    });

    it('should call onFiltersChange when region is selected', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const regionSelect = screen.getByRole('combobox');
      await user.selectOptions(regionSelect, 'Northern Savannah');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          region: 'Northern Savannah'
        });
      });
    });
  });

  describe('Age Range Filter', () => {
    it('should render age range inputs', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByPlaceholderText('Min age')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max age')).toBeInTheDocument();
    });

    it('should display current age values', () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const minAgeInput = screen.getByPlaceholderText('Min age') as HTMLInputElement;
      const maxAgeInput = screen.getByPlaceholderText('Max age') as HTMLInputElement;

      expect(minAgeInput.value).toBe('12');
      expect(maxAgeInput.value).toBe('36');
    });
  });

  describe('Weight Range Filter', () => {
    it('should render weight range inputs', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByPlaceholderText('Min weight')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max weight')).toBeInTheDocument();
    });
  });

  describe('Vaccination Status Filter', () => {
    it('should render vaccination status options', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('All cattle')).toBeInTheDocument();
      expect(screen.getByText('Vaccinated only')).toBeInTheDocument();
      expect(screen.getByText('Not vaccinated')).toBeInTheDocument();
    });

    it('should show selected vaccination status', () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const vaccinatedRadio = screen.getByRole('radio', { name: /Vaccinated only/i });
      expect(vaccinatedRadio).toBeChecked();
    });

    it('should call onFiltersChange when vaccination status is selected', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const vaccinatedRadio = screen.getByRole('radio', { name: /Vaccinated only/i });
      await user.click(vaccinatedRadio);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          vaccinationStatus: true
        });
      });
    });
  });

  describe('Active Filters Summary', () => {
    it('should show active filters summary when filters are applied', () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Zebu')).toBeInTheDocument();
      expect(screen.getByText('Sanga')).toBeInTheDocument();
      expect(screen.getByText('Ashanti')).toBeInTheDocument();
      expect(screen.getByText('Price: 1000 - 5000 GHS')).toBeInTheDocument();
      expect(screen.getByText('Vaccinated')).toBeInTheDocument();
    });

    it('should allow removing individual filters from summary', async () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const zebuTag = screen.getByText('Zebu').parentElement;
      const removeButton = zebuTag?.querySelector('button');
      
      if (removeButton) {
        await user.click(removeButton);
        
        await waitFor(() => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith({
            ...activeFilters,
            breed: 'Sanga'
          });
        });
      }
    });
  });

  describe('Reset Functionality', () => {
    it('should call onReset when clear all button is clicked', async () => {
      render(
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const clearAllButton = screen.getByText('Clear All');
      await user.click(clearAllButton);

      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have expand/collapse functionality for mobile', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      // The expand/collapse button should be present (though hidden on desktop)
      const expandButton = screen.getByRole('button', { name: '' }); // Arrow button
      expect(expandButton).toBeInTheDocument();
    });
  });

  describe('Debouncing', () => {
    it('should debounce filter changes for range inputs', async () => {
      vi.useFakeTimers();
      
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const minPriceInput = screen.getByPlaceholderText('Min price');
      await user.type(minPriceInput, '1000');

      // Should not call immediately
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          minPrice: 1000
        });
      });

      vi.useRealTimers();
    });
  });
});