import React from 'react';
import type { SortOptions } from '../../types';

interface SortControlsProps {
  sortOptions: SortOptions;
  onSortChange: (sortOptions: SortOptions) => void;
  resultCount?: number;
  className?: string;
}

const SORT_FIELDS = [
  { value: 'createdAt', label: 'Date Listed' },
  { value: 'price', label: 'Price' },
  { value: 'age', label: 'Age' },
  { value: 'weight', label: 'Weight' }
] as const;

export const SortControls: React.FC<SortControlsProps> = ({
  sortOptions,
  onSortChange,
  resultCount,
  className = ""
}) => {
  const handleFieldChange = (field: SortOptions['field']) => {
    onSortChange({
      ...sortOptions,
      field
    });
  };

  const handleDirectionToggle = () => {
    onSortChange({
      ...sortOptions,
      direction: sortOptions.direction === 'asc' ? 'desc' : 'asc'
    });
  };



  const getSortIcon = () => {
    return sortOptions.direction === 'asc' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
      </svg>
    );
  };

  return (
    <div className={`flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      {/* Results Count */}
      <div className="flex items-center space-x-4">
        {resultCount !== undefined && (
          <span className="text-sm text-gray-600">
            {resultCount === 0 ? (
              'No cattle found'
            ) : resultCount === 1 ? (
              '1 cattle found'
            ) : (
              `${resultCount.toLocaleString()} cattle found`
            )}
          </span>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600 hidden sm:block">Sort by:</span>
        
        {/* Sort Field Dropdown */}
        <div className="relative">
          <select
            value={sortOptions.field}
            onChange={(e) => handleFieldChange(e.target.value as SortOptions['field'])}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            {SORT_FIELDS.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Sort Direction Toggle */}
        <button
          onClick={handleDirectionToggle}
          className="flex items-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
          title={`Sort ${sortOptions.direction === 'asc' ? 'ascending' : 'descending'}`}
        >
          {getSortIcon()}
          <span className="hidden sm:block">
            {sortOptions.direction === 'asc' ? 'Low to High' : 'High to Low'}
          </span>
        </button>

        {/* View Toggle (Grid/List) - Optional for future enhancement */}
        <div className="hidden md:flex items-center space-x-1 border border-gray-300 rounded-md">
          <button
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-l-md transition-colors duration-150"
            title="Grid view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-r-md transition-colors duration-150"
            title="List view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortControls;