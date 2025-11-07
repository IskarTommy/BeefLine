import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchSuggestion, SearchHistory } from '../../types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const POPULAR_SEARCHES = [
  'West African Shorthorn',
  'Zebu',
  'Sanga',
  'Ashanti',
  'Northern Savannah',
  'vaccinated cattle'
];

const BREED_SUGGESTIONS = [
  'West African Shorthorn',
  'Zebu', 
  'Sanga'
];

const REGION_SUGGESTIONS = [
  'Ashanti',
  'Northern Savannah',
  'Greater Accra',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Upper East',
  'Upper West',
  'Brong Ahafo'
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search cattle by breed, region, or keywords...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('beefline-search-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSearchHistory(history.slice(0, 5)); // Keep only last 5 searches
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Generate suggestions based on query
  const generateSuggestions = useCallback((searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery.trim()) {
      // Show recent searches and popular searches when no query
      const recentSuggestions: SearchSuggestion[] = searchHistory.map((item, index) => ({
        id: `recent-${index}`,
        text: item.query,
        type: 'recent'
      }));

      const popularSuggestions: SearchSuggestion[] = POPULAR_SEARCHES.map((search, index) => ({
        id: `popular-${index}`,
        text: search,
        type: 'popular'
      }));

      return [...recentSuggestions, ...popularSuggestions].slice(0, 8);
    }

    const lowerQuery = searchQuery.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Add matching breeds
    BREED_SUGGESTIONS.forEach((breed, index) => {
      if (breed.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          id: `breed-${index}`,
          text: breed,
          type: 'breed'
        });
      }
    });

    // Add matching regions
    REGION_SUGGESTIONS.forEach((region, index) => {
      if (region.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          id: `region-${index}`,
          text: region,
          type: 'region'
        });
      }
    });

    // Add matching recent searches
    searchHistory.forEach((item, index) => {
      if (item.query.toLowerCase().includes(lowerQuery) && 
          !suggestions.some(s => s.text === item.query)) {
        suggestions.push({
          id: `recent-${index}`,
          text: item.query,
          type: 'recent'
        });
      }
    });

    return suggestions.slice(0, 6);
  }, [searchHistory]);

  // Update suggestions when query changes
  useEffect(() => {
    const newSuggestions = generateSuggestions(query);
    setSuggestions(newSuggestions);
    setSelectedIndex(-1);
  }, [query, generateSuggestions]);

  // Save search to history
  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const newHistory = [
      { query: searchQuery.trim(), timestamp: new Date() },
      ...searchHistory.filter(item => item.query !== searchQuery.trim())
    ].slice(0, 5);

    setSearchHistory(newHistory);
    localStorage.setItem('beefline-search-history', JSON.stringify(newHistory));
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      saveToHistory(trimmedQuery);
      onSearch(trimmedQuery);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSearch(suggestions[selectedIndex].text);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(true);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && 
          !suggestionsRef.current.contains(event.target as Node) &&
          !inputRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'breed':
        return '🐄';
      case 'region':
        return '📍';
      case 'recent':
        return '🕒';
      case 'popular':
        return '🔥';
      default:
        return '🔍';
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {!query && searchHistory.length > 0 && (
            <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              Recent Searches
            </div>
          )}
          {!query && searchHistory.length === 0 && (
            <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              Popular Searches
            </div>
          )}
          
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                <span className="flex-1">{suggestion.text}</span>
                {suggestion.type === 'breed' && (
                  <span className="text-xs text-gray-500">Breed</span>
                )}
                {suggestion.type === 'region' && (
                  <span className="text-xs text-gray-500">Region</span>
                )}
              </div>
            </button>
          ))}
          
          {query && (
            <button
              onClick={() => handleSearch()}
              className="w-full px-4 py-3 text-left border-t border-gray-100 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 text-blue-600 font-medium"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search for "{query}"</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;