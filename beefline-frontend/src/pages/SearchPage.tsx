import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, FilterPanel, SortControls } from '../components/search';
import { CowList } from '../components/cattle';
import type { Cattle } from '../types';
import { useSearch } from '../hooks/useSearch';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Use the search hook for all search functionality
  const {
    query,
    filters,
    sortOptions,
    cattle,
    loading,
    error,
    pagination,
    setFilters,
    setSortOptions,
    resetFilters,
    search,
    goToPage
  } = useSearch();

  // Handle search
  const handleSearch = (searchQuery: string) => {
    search(searchQuery);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Handle filter reset
  const handleFiltersReset = () => {
    resetFilters();
  };

  // Handle sort changes
  const handleSortChange = (newSort: any) => {
    setSortOptions(newSort);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    goToPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle cattle click
  const handleCattleClick = (cattle: Cattle) => {
    navigate(`/cattle/${cattle.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Cattle
          </h1>
          <SearchBar
            onSearch={handleSearch}
            className="max-w-2xl"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Sort Controls */}
            <SortControls
              sortOptions={sortOptions}
              onSortChange={handleSortChange}
              resultCount={pagination.total}
              className="mb-6"
            />

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

            {/* Results */}
            <CowList
              cattle={cattle}
              loading={loading}
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              onCattleClick={handleCattleClick}
            />

            {/* No Results Message */}
            {!loading && cattle.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cattle found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  {query || Object.keys(filters).length > 0 ? (
                    "We couldn't find any cattle matching your search criteria. Try adjusting your filters or search terms."
                  ) : (
                    "No cattle listings are currently available. Please check back later."
                  )}
                </p>
                {(query || Object.keys(filters).length > 0) && (
                  <button
                    onClick={() => {
                      search('');
                      handleFiltersReset();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;