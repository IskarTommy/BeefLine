import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Cattle, SearchFilters, SortOptions } from '../../types';
import { CowList } from '../cattle';
import { SortControls } from './SortControls';

interface SearchResultsContainerProps {
  cattle: Cattle[];
  loading?: boolean;
  error?: string | null;
  query?: string;
  filters?: SearchFilters;
  sortOptions?: SortOptions;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSortChange?: (sortOptions: SortOptions) => void;
  onClearFilters?: () => void;
  showSortControls?: boolean;
  showResultsSummary?: boolean;
  className?: string;
}

export const SearchResultsContainer: React.FC<SearchResultsContainerProps> = ({
  cattle,
  loading = false,
  error = null,
  query = '',
  filters = {},
  sortOptions,
  pagination,
  onSortChange,
  onClearFilters,
  showSortControls = true,
  showResultsSummary = true,
  className = ""
}) => {
  const navigate = useNavigate();

  // Handle cattle click
  const handleCattleClick = (cattle: Cattle) => {
    navigate(`/cattle/${cattle.id}`);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (pagination?.onPageChange) {
      pagination.onPageChange(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check if there are active filters
  const hasActiveFilters = query || Object.keys(filters).some(key => 
    filters[key as keyof SearchFilters] !== undefined && 
    filters[key as keyof SearchFilters] !== null && 
    filters[key as keyof SearchFilters] !== ''
  );

  // Generate filter summary text
  const getFilterSummary = () => {
    const parts: string[] = [];
    
    if (query) {
      parts.push(`Search: "${query}"`);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        switch (key) {
          case 'breed':
            if (typeof value === 'string') {
              parts.push(`Breed: ${value.split(',').join(', ')}`);
            }
            break;
          case 'region':
            parts.push(`Region: ${value}`);
            break;
          case 'vaccinationStatus':
            parts.push(`Vaccination: ${value ? 'Required' : 'Not required'}`);
            break;
          case 'minPrice':
          case 'maxPrice':
            // Handle price range separately
            break;
        }
      }
    });

    // Add price range if present
    if (filters.minPrice || filters.maxPrice) {
      parts.push(`Price: GHS ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}`);
    }

    // Add age range if present
    if (filters.minAge || filters.maxAge) {
      parts.push(`Age: ${filters.minAge || 0} - ${filters.maxAge || '∞'} months`);
    }

    // Add weight range if present
    if (filters.minWeight || filters.maxWeight) {
      parts.push(`Weight: ${filters.minWeight || 0} - ${filters.maxWeight || '∞'} kg`);
    }

    return parts.join(' • ');
  };

  return (
    <div className={className}>
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {showResultsSummary && !loading && !error && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {hasActiveFilters && (
                <p className="mb-1">
                  {getFilterSummary()}
                </p>
              )}
              <p className="text-gray-500">
                {pagination ? (
                  pagination.total === 0 ? (
                    'No cattle found'
                  ) : pagination.total === 1 ? (
                    '1 cattle found'
                  ) : (
                    `${pagination.total.toLocaleString()} cattle found`
                  )
                ) : (
                  cattle.length === 0 ? (
                    'No cattle found'
                  ) : cattle.length === 1 ? (
                    '1 cattle found'
                  ) : (
                    `${cattle.length} cattle found`
                  )
                )}
              </p>
            </div>
            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sort Controls */}
      {showSortControls && sortOptions && onSortChange && !loading && !error && cattle.length > 0 && (
        <SortControls
          sortOptions={sortOptions}
          onSortChange={onSortChange}
          resultCount={pagination?.total || cattle.length}
          className="mb-6"
        />
      )}

      {/* Results */}
      <CowList
        cattle={cattle}
        loading={loading}
        pagination={pagination ? {
          ...pagination,
          limit: 12, // Default page size
          onPageChange: handlePageChange
        } : undefined}
        onCattleClick={handleCattleClick}
      />

      {/* No Results Message with Suggestions */}
      {!loading && cattle.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cattle found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {hasActiveFilters ? (
              "We couldn't find any cattle matching your search criteria. Try adjusting your filters or search terms."
            ) : (
              "No cattle listings are currently available. Please check back later."
            )}
          </p>
          
          {hasActiveFilters && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p className="font-medium mb-2">Try these suggestions:</p>
                <ul className="text-left max-w-sm mx-auto space-y-1">
                  <li>• Remove some filters to see more results</li>
                  <li>• Check your spelling and try different keywords</li>
                  <li>• Expand your price or location range</li>
                  <li>• Browse all available cattle</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {onClearFilters && (
                  <button
                    onClick={onClearFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    Clear all filters
                  </button>
                )}
                <button
                  onClick={() => navigate('/search')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  Browse all cattle
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsContainer;