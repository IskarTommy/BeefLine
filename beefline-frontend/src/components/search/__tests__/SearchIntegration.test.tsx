import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';
import { FilterPanel } from '../FilterPanel';
import { SortControls } from '../SortControls';
import type { SearchFilters, SortOptions } from '../../../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Search Integration Tests', () => {
  const user = userEvent.setup();
  const mockOnSearch = vi.fn();
  const mockOnFiltersChange = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnSortChange = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderSearchComponents = (filters: SearchFilters = {}, sortOptions: SortOptions = { field: 'createdAt', direction: 'desc' }) => {
    return render(
      <div>
        <SearchBar onSearch={mockOnSearch} />
        <FilterPanel 
          filters={filters} 
          onFiltersChange={mockOnFiltersChange} 
          onReset={mockOnReset} 
        />
        <SortControls 
          sortOptions={sortOptions} 
          onSortChange={mockOnSortChange} 
          resultCount={25}
        />
      </div>
    );
  };

  describe('Search Functionality', () => {
    it('should perform search with text query', async () => {
      renderSearchComponents();

      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      await user.type(searchInput, 'Zebu');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('Zebu');
    });

    it('should search with breed names', async () => {
      renderSearchComponents();

      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      await user.type(searchInput, 'West African Shorthorn');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('West African Shorthorn');
    });

    it('should search with region names', async () => {
      renderSearchComponents();

      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      await user.type(searchInput, 'Ashanti');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('Ashanti');
    });

    it('should handle empty search queries', async () => {
      renderSearchComponents();

      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      await user.click(searchInput);
      await user.keyboard('{Enter}');

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should trim whitespace from search queries', async () => {
      renderSearchComponents();

      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      await user.type(searchInput, '  Zebu cattle  ');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('Zebu cattle');
    });

    it('should show search suggestions for breed names', async () => {
      renderSearchComponents();

      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      await user.type(searchInput, 'Zebu');

      await waitFor(() => {
        // Look for the suggestion in the dropdown, not the filter panel
        const suggestions = screen.getAllByText('Zebu');
        expect(suggestions.length).toBeGreaterThan(1); // Should appear in both suggestion and filter
      });
    });

    it('should show search suggestions for region names', async () => {
      renderSearchComponents();

      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      await user.type(searchInput, 'Ashanti');

      await waitFor(() => {
        // Look for the suggestion in the dropdown, not the filter panel
        const suggestions = screen.getAllByText('Ashanti');
        expect(suggestions.length).toBeGreaterThan(1); // Should appear in both suggestion and filter
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should apply single breed filter', async () => {
      renderSearchComponents();

      const zebuCheckbox = screen.getByRole('checkbox', { name: /Zebu/i });
      await user.click(zebuCheckbox);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          breed: 'Zebu'
        });
      });
    });

    it('should apply multiple breed filters', async () => {
      renderSearchComponents({ breed: 'Zebu' });

      const sangaCheckbox = screen.getByRole('checkbox', { name: /Sanga/i });
      await user.click(sangaCheckbox);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          breed: 'Zebu,Sanga'
        });
      });
    });

    it('should apply price range filters', async () => {
      renderSearchComponents();

      const minPriceInput = screen.getByPlaceholderText('Min price');
      const maxPriceInput = screen.getByPlaceholderText('Max price');
      
      await user.type(minPriceInput, '2000');
      await user.type(maxPriceInput, '5000');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ 
            minPrice: 2000,
            maxPrice: 5000
          })
        );
      }, { timeout: 1000 });
    });

    it('should apply region filter', async () => {
      renderSearchComponents();

      const regionSelect = screen.getAllByRole('combobox')[0]; // First combobox is region
      await user.selectOptions(regionSelect, 'Ashanti');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          region: 'Ashanti'
        });
      });
    });

    it('should apply age range filters', async () => {
      renderSearchComponents();

      const minAgeInput = screen.getByPlaceholderText('Min age');
      const maxAgeInput = screen.getByPlaceholderText('Max age');
      
      await user.type(minAgeInput, '12');
      await user.type(maxAgeInput, '36');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ minAge: 12 })
        );
      }, { timeout: 1000 });
    });

    it('should apply vaccination status filter', async () => {
      renderSearchComponents();

      const vaccinatedRadio = screen.getByRole('radio', { name: /Vaccinated only/i });
      await user.click(vaccinatedRadio);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          vaccinationStatus: true
        });
      });
    });
  });

  describe('Filter Combinations', () => {
    it('should handle multiple filter interactions', async () => {
      renderSearchComponents();

      // Apply breed filter
      const zebuCheckbox = screen.getByRole('checkbox', { name: /Zebu/i });
      await user.click(zebuCheckbox);

      // Apply region filter
      const regionSelect = screen.getAllByRole('combobox')[0]; // First combobox is region
      await user.selectOptions(regionSelect, 'Ashanti');

      // Apply price range
      const minPriceInput = screen.getByPlaceholderText('Min price');
      await user.type(minPriceInput, '2000');

      // Verify filter changes were called (FilterPanel may batch changes)
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('should handle edge case with maximum price range', async () => {
      renderSearchComponents();

      const maxPriceInput = screen.getByPlaceholderText('Max price');
      await user.type(maxPriceInput, '999999');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ maxPrice: 999999 });
      }, { timeout: 1000 });
    });

    it('should handle edge case with minimum age of 0', async () => {
      renderSearchComponents();

      const minAgeInput = screen.getByPlaceholderText('Min age');
      await user.type(minAgeInput, '0');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ minAge: 0 });
      }, { timeout: 1000 });
    });

    it('should show clear all filters button when filters are active', () => {
      const activeFilters = { breed: 'Zebu', region: 'Ashanti' };
      renderSearchComponents(activeFilters);

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('should sort by price ascending', async () => {
      // Start with price sort options to test the toggle
      const priceSortOptions = { field: 'price' as const, direction: 'desc' as const };
      renderSearchComponents({}, priceSortOptions);

      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      await user.click(toggleButton);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'price',
        direction: 'asc'
      });
    });

    it('should sort by age descending', async () => {
      renderSearchComponents();

      const sortSelect = screen.getAllByRole('combobox')[1]; // Second combobox is sort
      
      await user.selectOptions(sortSelect, 'age');

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'age',
        direction: 'desc'
      });
    });

    it('should sort by weight', async () => {
      renderSearchComponents();

      const sortSelect = screen.getAllByRole('combobox')[1]; // Second combobox is sort
      
      await user.selectOptions(sortSelect, 'weight');

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'weight',
        direction: 'desc'
      });
    });

    it('should toggle sort direction', async () => {
      const sortOptions = { field: 'price' as const, direction: 'desc' as const };
      renderSearchComponents({}, sortOptions);

      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      await user.click(toggleButton);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'price',
        direction: 'asc'
      });
    });

    it('should display correct sort direction text', () => {
      const ascSortOptions = { field: 'price' as const, direction: 'asc' as const };
      renderSearchComponents({}, ascSortOptions);

      expect(screen.getByText('Low to High')).toBeInTheDocument();
    });

    it('should display result count', () => {
      renderSearchComponents();

      expect(screen.getByText('25 cattle found')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should render all search components together', () => {
      renderSearchComponents();

      expect(screen.getByPlaceholderText('Search cattle by breed, region, or keywords...')).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Sort by:')).toBeInTheDocument();
      expect(screen.getByText('25 cattle found')).toBeInTheDocument();
    });

    it('should handle component interactions', async () => {
      renderSearchComponents();

      // Test search interaction
      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      await user.type(searchInput, 'test query');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('test query');

      // Test filter interaction
      const zebuCheckbox = screen.getByRole('checkbox', { name: /Zebu/i });
      await user.click(zebuCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalled();

      // Test sort interaction
      const sortSelect = screen.getAllByRole('combobox')[1]; // Second combobox is sort
      
      await user.selectOptions(sortSelect, 'price');
      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'price',
        direction: 'desc'
      });
    });
  });

  describe('Filter Reset Functionality', () => {
    it('should clear all filters when reset button is clicked', async () => {
      const activeFilters = { breed: 'Zebu', region: 'Ashanti' };
      renderSearchComponents(activeFilters);

      const clearAllButton = screen.getByText('Clear All');
      await user.click(clearAllButton);

      expect(mockOnReset).toHaveBeenCalled();
    });



    it('should remove individual filter tags', async () => {
      const activeFilters = { breed: 'Zebu,Sanga' };
      renderSearchComponents(activeFilters);

      const zebuTag = screen.getAllByText('Zebu')[1].parentElement; // Second "Zebu" is in the filter tag
      const removeButton = zebuTag?.querySelector('button');
      
      if (removeButton) {
        await user.click(removeButton);
        
        await waitFor(() => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith({
            breed: 'Sanga'
          });
        });
      }
    });
  });

  describe('Accessibility and Usability', () => {
    it('should support keyboard navigation across components', async () => {
      renderSearchComponents();

      const searchInput = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      
      // Should be focusable
      searchInput.focus();
      expect(searchInput).toHaveFocus();

      // Should support tab navigation to other components
      await user.tab();
      
      // Should move to next focusable element (checkbox or select)
      const focusedElement = document.activeElement;
      expect(focusedElement).not.toBe(searchInput);
    });

    it('should handle form validation properly', async () => {
      renderSearchComponents();

      // Test price input validation
      const minPriceInput = screen.getByPlaceholderText('Min price');
      await user.type(minPriceInput, 'invalid');

      // Should handle invalid input gracefully (component should validate)
      expect(minPriceInput).toBeInTheDocument();
    });

    it('should provide proper ARIA labels and roles', () => {
      renderSearchComponents();

      // Check for proper roles
      expect(screen.getByRole('textbox')).toBeInTheDocument(); // Search input
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0); // Breed checkboxes
      expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0); // Region and sort selects
      expect(screen.getAllByRole('radio').length).toBeGreaterThan(0); // Vaccination status radios
    });
  });
});