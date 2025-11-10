import React from 'react';
import { SearchBar, FilterPanel, SearchResultsContainer } from '../components/search';
import { useSearch } from '../hooks/useSearch';

export const SearchPage: React.FC = () => {
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

  // Handle clear all filters
  const handleClearAll = () => {
    search('');
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Search Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Cattle
          </h1>
          <SearchBar
            onSearch={handleSearch}
            className="max-w-2xl"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          
          {/* Sidebar - Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
            />
          </div>

          {/* Main Content - Search Results */}
          <div className="flex-1 min-w-0">
            <SearchResultsContainer
              cattle={cattle}
              loading={loading}
              error={error}
              query={query}
              filters={filters}
              sortOptions={sortOptions}
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                total: pagination.total,
                onPageChange: goToPage
              }}
              onSortChange={handleSortChange}
              onClearFilters={handleClearAll}
              showSortControls={true}
              showResultsSummary={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
