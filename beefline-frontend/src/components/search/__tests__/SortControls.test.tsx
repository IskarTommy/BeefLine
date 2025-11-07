import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SortControls } from '../SortControls';
import type { SortOptions } from '../../../types';

describe('SortControls', () => {
  const mockOnSortChange = vi.fn();
  const user = userEvent.setup();

  const defaultSortOptions: SortOptions = {
    field: 'createdAt',
    direction: 'desc'
  };

  const priceSortOptions: SortOptions = {
    field: 'price',
    direction: 'asc'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sort controls with default options', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('Sort by:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Date Listed')).toBeInTheDocument();
    });

    it('should render result count when provided', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
          resultCount={25}
        />
      );

      expect(screen.getByText('25 cattle found')).toBeInTheDocument();
    });

    it('should render singular form for one result', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
          resultCount={1}
        />
      );

      expect(screen.getByText('1 cattle found')).toBeInTheDocument();
    });

    it('should render no results message when count is zero', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
          resultCount={0}
        />
      );

      expect(screen.getByText('No cattle found')).toBeInTheDocument();
    });

    it('should format large numbers with commas', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
          resultCount={1234}
        />
      );

      expect(screen.getByText('1,234 cattle found')).toBeInTheDocument();
    });
  });

  describe('Sort Field Selection', () => {
    it('should render all sort field options', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      // Check if all options are present
      expect(screen.getByText('Date Listed')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Weight')).toBeInTheDocument();
    });

    it('should show selected sort field', () => {
      render(
        <SortControls
          sortOptions={priceSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('price');
    });

    it('should call onSortChange when sort field is changed', async () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'price');

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'price',
        direction: 'desc'
      });
    });
  });

  describe('Sort Direction Toggle', () => {
    it('should render direction toggle button', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show correct direction text for descending', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('High to Low')).toBeInTheDocument();
    });

    it('should show correct direction text for ascending', () => {
      render(
        <SortControls
          sortOptions={priceSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('Low to High')).toBeInTheDocument();
    });

    it('should call onSortChange when direction is toggled', async () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      await user.click(toggleButton);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'createdAt',
        direction: 'asc'
      });
    });

    it('should toggle from ascending to descending', async () => {
      render(
        <SortControls
          sortOptions={priceSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /low to high/i });
      await user.click(toggleButton);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'price',
        direction: 'desc'
      });
    });
  });

  describe('Sort Icons', () => {
    it('should render ascending icon for ascending direction', () => {
      render(
        <SortControls
          sortOptions={priceSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /low to high/i });
      const icon = toggleButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render descending icon for descending direction', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      const icon = toggleButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('View Toggle Buttons', () => {
    it('should render view toggle buttons on desktop', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      // Grid and list view buttons should be present (though hidden on mobile)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1); // Sort toggle + view toggles
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      expect(toggleButton).toHaveAttribute('title', 'Sort descending');
    });

    it('should support keyboard navigation', async () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const select = screen.getByRole('combobox');
      
      // Should be focusable
      select.focus();
      expect(select).toHaveFocus();

      // Should support tab navigation
      await user.tab();
      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      expect(toggleButton).toHaveFocus();
    });

    it('should support Enter key for button activation', async () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      toggleButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'createdAt',
        direction: 'asc'
      });
    });

    it('should support Space key for button activation', async () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /high to low/i });
      toggleButton.focus();
      await user.keyboard(' ');

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'createdAt',
        direction: 'asc'
      });
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined resultCount gracefully', () => {
      render(
        <SortControls
          sortOptions={defaultSortOptions}
          onSortChange={mockOnSortChange}
        />
      );

      // Should not show result count when undefined
      expect(screen.queryByText(/cattle found/)).not.toBeInTheDocument();
    });

    it('should handle all sort field types', () => {
      const sortFields: SortOptions['field'][] = ['createdAt', 'price', 'age', 'weight'];
      
      sortFields.forEach(field => {
        const { rerender } = render(
          <SortControls
            sortOptions={{ field, direction: 'asc' }}
            onSortChange={mockOnSortChange}
          />
        );

        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe(field);

        rerender(<div />); // Clean up for next iteration
      });
    });
  });
});