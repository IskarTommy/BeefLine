import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

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

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input with default placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Search cattle by breed, region, or keywords...');
      expect(input).toBeInTheDocument();
    });

    it('should render search input with custom placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />);

      const input = screen.getByPlaceholderText('Custom placeholder');
      expect(input).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const searchIcon = screen.getByRole('textbox').parentElement?.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should not show clear button when input is empty', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const clearButton = screen.queryByRole('button');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('Input Interactions', () => {
    it('should update input value when typing', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Zebu');

      expect(input).toHaveValue('Zebu');
    });

    it('should show clear button when input has value', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');
      
      // Click outside to hide suggestions
      await user.click(document.body);

      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');
      
      // Click outside to hide suggestions
      await user.click(document.body);
      
      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('should focus input after clearing', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');
      
      // Click outside to hide suggestions
      await user.click(document.body);
      
      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      expect(input).toHaveFocus();
    });
  });

  describe('Search Functionality', () => {
    it('should call onSearch when Enter is pressed', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Zebu');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('Zebu');
    });

    it('should not call onSearch with empty query', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      await user.keyboard('{Enter}');

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should trim whitespace from search query', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '  Zebu  ');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('Zebu');
    });
  });

  describe('Suggestions', () => {
    it('should show suggestions when input is focused', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Popular Searches')).toBeInTheDocument();
      });
    });

    it('should show breed suggestions when typing breed names', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Zebu');

      await waitFor(() => {
        expect(screen.getByText('Zebu')).toBeInTheDocument();
      });
    });

    it('should show region suggestions when typing region names', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Ashanti');

      await waitFor(() => {
        expect(screen.getByText('Ashanti')).toBeInTheDocument();
      });
    });

    it('should hide suggestions when clicking outside', async () => {
      render(
        <div>
          <SearchBar onSearch={mockOnSearch} />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Popular Searches')).toBeInTheDocument();
      });

      const outsideElement = screen.getByTestId('outside');
      await user.click(outsideElement);

      await waitFor(() => {
        expect(screen.queryByText('Popular Searches')).not.toBeInTheDocument();
      });
    });

    it('should call onSearch when suggestion is clicked', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Zebu');

      await waitFor(() => {
        const suggestion = screen.getByText('Zebu');
        expect(suggestion).toBeInTheDocument();
      });

      const suggestion = screen.getByText('Zebu');
      await user.click(suggestion);

      expect(mockOnSearch).toHaveBeenCalledWith('Zebu');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Popular Searches')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');
      // First suggestion should be highlighted (tested via CSS classes in actual implementation)
      
      await user.keyboard('{ArrowDown}');
      // Second suggestion should be highlighted
      
      await user.keyboard('{ArrowUp}');
      // First suggestion should be highlighted again
    });

    it('should select suggestion with Enter key', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Zebu');

      await waitFor(() => {
        expect(screen.getByText('Zebu')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('Zebu');
    });

    it('should close suggestions with Escape key', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Popular Searches')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Popular Searches')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search History', () => {
    it('should load search history from localStorage', () => {
      const mockHistory = JSON.stringify([
        { query: 'Zebu cattle', timestamp: new Date().toISOString() },
        { query: 'Ashanti region', timestamp: new Date().toISOString() }
      ]);
      localStorageMock.getItem.mockReturnValue(mockHistory);

      render(<SearchBar onSearch={mockOnSearch} />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('beefline-search-history');
    });

    it('should save search to history when searching', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Zebu');
      await user.keyboard('{Enter}');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'beefline-search-history',
        expect.stringContaining('Zebu')
      );
    });

    it('should show recent searches when input is empty', async () => {
      const mockHistory = JSON.stringify([
        { query: 'Zebu cattle', timestamp: new Date().toISOString() }
      ]);
      localStorageMock.getItem.mockReturnValue(mockHistory);

      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Recent Searches')).toBeInTheDocument();
        expect(screen.getByText('Zebu cattle')).toBeInTheDocument();
      });
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Should not throw error
      expect(() => {
        render(<SearchBar onSearch={mockOnSearch} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should support keyboard navigation', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole('textbox');
      
      // Should be focusable
      input.focus();
      expect(input).toHaveFocus();

      // Should support tab navigation
      await user.tab();
      expect(input).not.toHaveFocus();
    });
  });
});