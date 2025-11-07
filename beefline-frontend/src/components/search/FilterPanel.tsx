import React, { useState, useEffect } from 'react';
import type { SearchFilters } from '../../types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset: () => void;
  className?: string;
}

const BREED_OPTIONS = [
  { value: 'West African Shorthorn', label: 'West African Shorthorn' },
  { value: 'Zebu', label: 'Zebu' },
  { value: 'Sanga', label: 'Sanga' }
];

const REGION_OPTIONS = [
  { value: 'Ashanti', label: 'Ashanti' },
  { value: 'Northern Savannah', label: 'Northern Savannah' },
  { value: 'Greater Accra', label: 'Greater Accra' },
  { value: 'Western', label: 'Western' },
  { value: 'Central', label: 'Central' },
  { value: 'Eastern', label: 'Eastern' },
  { value: 'Volta', label: 'Volta' },
  { value: 'Upper East', label: 'Upper East' },
  { value: 'Upper West', label: 'Upper West' },
  { value: 'Brong Ahafo', label: 'Brong Ahafo' }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onReset,
  className = ""
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Apply filters with debouncing for range inputs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, onFiltersChange]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBreedChange = (breed: string) => {
    const currentBreeds = localFilters.breed ? localFilters.breed.split(',') : [];
    const updatedBreeds = currentBreeds.includes(breed)
      ? currentBreeds.filter(b => b !== breed)
      : [...currentBreeds, breed];
    
    updateFilter('breed', updatedBreeds.length > 0 ? updatedBreeds.join(',') : undefined);
  };

  const handleRegionChange = (region: string) => {
    updateFilter('region', localFilters.region === region ? undefined : region);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const getSelectedBreeds = () => {
    return localFilters.breed ? localFilters.breed.split(',') : [];
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-6">
          
          {/* Breed Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Breed
            </label>
            <div className="space-y-2">
              {BREED_OPTIONS.map((breed) => {
                const isSelected = getSelectedBreeds().includes(breed.value);
                return (
                  <label key={breed.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleBreedChange(breed.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{breed.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range (GHS)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min price"
                  value={localFilters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max price"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Price Range Slider */}
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={localFilters.maxPrice || 50000}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>GHS 0</span>
                <span>GHS 50,000+</span>
              </div>
            </div>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Region
            </label>
            <select
              value={localFilters.region || ''}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Regions</option>
              {REGION_OPTIONS.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          {/* Age Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Age Range (months)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min age"
                  value={localFilters.minAge || ''}
                  onChange={(e) => updateFilter('minAge', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max age"
                  value={localFilters.maxAge || ''}
                  onChange={(e) => updateFilter('maxAge', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Weight Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Weight Range (kg)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min weight"
                  value={localFilters.minWeight || ''}
                  onChange={(e) => updateFilter('minWeight', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max weight"
                  value={localFilters.maxWeight || ''}
                  onChange={(e) => updateFilter('maxWeight', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Vaccination Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Health Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="vaccination"
                  checked={localFilters.vaccinationStatus === undefined}
                  onChange={() => updateFilter('vaccinationStatus', undefined)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">All cattle</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="vaccination"
                  checked={localFilters.vaccinationStatus === true}
                  onChange={() => updateFilter('vaccinationStatus', true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Vaccinated only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="vaccination"
                  checked={localFilters.vaccinationStatus === false}
                  onChange={() => updateFilter('vaccinationStatus', false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Not vaccinated</span>
              </label>
            </div>
          </div>

        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {getSelectedBreeds().map((breed) => (
                <span
                  key={breed}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {breed}
                  <button
                    onClick={() => handleBreedChange(breed)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {localFilters.region && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {localFilters.region}
                  <button
                    onClick={() => updateFilter('region', undefined)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(localFilters.minPrice || localFilters.maxPrice) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Price: {localFilters.minPrice || 0} - {localFilters.maxPrice || '∞'} GHS
                  <button
                    onClick={() => {
                      updateFilter('minPrice', undefined);
                      updateFilter('maxPrice', undefined);
                    }}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {localFilters.vaccinationStatus !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {localFilters.vaccinationStatus ? 'Vaccinated' : 'Not vaccinated'}
                  <button
                    onClick={() => updateFilter('vaccinationStatus', undefined)}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;