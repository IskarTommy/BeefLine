import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchFilters, SortOptions, Cattle } from '../types';
import { cattleAPI } from '../services/api';

interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  initialSort?: SortOptions;
  pageSize?: number;
}

interface UseSearchReturn {
  // State
  query: string;
  filters: SearchFilters;
  sortOptions: SortOptions;
  cattle: Cattle[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setSortOptions: (sort: SortOptions) => void;
  resetFilters: () => void;
  search: (searchQuery?: string) => void;
  goToPage: (page: number) => void;
  refetch: () => void;
}

const DEFAULT_SORT: SortOptions = {
  field: 'createdAt',
  direction: 'desc'
};

const DEFAULT_FILTERS: SearchFilters = {};

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    initialQuery = '',
    initialFilters = DEFAULT_FILTERS,
    initialSort = DEFAULT_SORT,
    pageSize = 12
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [query, setQueryState] = useState(initialQuery);
  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters);
  const [sortOptions, setSortOptionsState] = useState<SortOptions>(initialSort);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: pageSize
  });

  // Initialize from URL parameters
  useEffect(() => {
    const urlQuery = searchParams.get('q') || initialQuery;
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlSortField = searchParams.get('sort') as SortOptions['field'] || initialSort.field;
    const urlSortDirection = searchParams.get('order') as SortOptions['direction'] || initialSort.direction;
    
    // Parse filters from URL
    const urlFilters: SearchFilters = { ...initialFilters };
    if (searchParams.get('breed')) urlFilters.breed = searchParams.get('breed')!;
    if (searchParams.get('region')) urlFilters.region = searchParams.get('region')!;
    if (searchParams.get('minPrice')) urlFilters.minPrice = parseInt(searchParams.get('minPrice')!);
    if (searchParams.get('maxPrice')) urlFilters.maxPrice = parseInt(searchParams.get('maxPrice')!);
    if (searchParams.get('minAge')) urlFilters.minAge = parseInt(searchParams.get('minAge')!);
    if (searchParams.get('maxAge')) urlFilters.maxAge = parseInt(searchParams.get('maxAge')!);
    if (searchParams.get('minWeight')) urlFilters.minWeight = parseInt(searchParams.get('minWeight')!);
    if (searchParams.get('maxWeight')) urlFilters.maxWeight = parseInt(searchParams.get('maxWeight')!);
    if (searchParams.get('vaccinated')) {
      urlFilters.vaccinationStatus = searchParams.get('vaccinated') === 'true';
    }

    setQueryState(urlQuery);
    setFiltersState(urlFilters);
    setSortOptionsState({ field: urlSortField, direction: urlSortDirection });
    setPagination(prev => ({ ...prev, currentPage: urlPage }));
  }, [searchParams, initialQuery, initialFilters, initialSort]);

  // Update URL parameters
  const updateUrlParams = useCallback((
    newQuery: string,
    newFilters: SearchFilters,
    newSort: SortOptions,
    newPage: number
  ) => {
    const params = new URLSearchParams();
    
    if (newQuery) params.set('q', newQuery);
    if (newFilters.breed) params.set('breed', newFilters.breed);
    if (newFilters.region) params.set('region', newFilters.region);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.minAge) params.set('minAge', newFilters.minAge.toString());
    if (newFilters.maxAge) params.set('maxAge', newFilters.maxAge.toString());
    if (newFilters.minWeight) params.set('minWeight', newFilters.minWeight.toString());
    if (newFilters.maxWeight) params.set('maxWeight', newFilters.maxWeight.toString());
    if (newFilters.vaccinationStatus !== undefined) {
      params.set('vaccinated', newFilters.vaccinationStatus.toString());
    }

    if (newSort.field !== DEFAULT_SORT.field) params.set('sort', newSort.field);
    if (newSort.direction !== DEFAULT_SORT.direction) params.set('order', newSort.direction);
    if (newPage > 1) params.set('page', newPage.toString());

    setSearchParams(params);
  }, [setSearchParams]);

  // Fetch cattle data
  const fetchCattle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare search filters including query
      const searchFilters: SearchFilters = { ...filters };
      if (query) {
        // Add search query to filters - the API should handle this
        (searchFilters as any).search = query;
      }

      const response = await cattleAPI.getCattle(
        searchFilters,
        sortOptions,
        pagination.currentPage,
        pagination.limit
      );
      
      setCattle(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (err: any) {
      setError('An error occurred while searching for cattle');
      setCattle([]);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, filters, sortOptions, pagination.currentPage, pagination.limit]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchCattle();
  }, [fetchCattle]);

  // Action handlers
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams(newQuery, filters, sortOptions, 1);
  }, [filters, sortOptions, updateUrlParams]);

  const setFilters = useCallback((newFilters: SearchFilters) => {
    setFiltersState(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams(query, newFilters, sortOptions, 1);
  }, [query, sortOptions, updateUrlParams]);

  const setSortOptions = useCallback((newSort: SortOptions) => {
    setSortOptionsState(newSort);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams(query, filters, newSort, 1);
  }, [query, filters, updateUrlParams]);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams(query, DEFAULT_FILTERS, sortOptions, 1);
  }, [query, sortOptions, updateUrlParams]);

  const search = useCallback((searchQuery?: string) => {
    const newQuery = searchQuery !== undefined ? searchQuery : query;
    setQueryState(newQuery);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams(newQuery, filters, sortOptions, 1);
  }, [query, filters, sortOptions, updateUrlParams]);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    updateUrlParams(query, filters, sortOptions, page);
  }, [query, filters, sortOptions, updateUrlParams]);

  const refetch = useCallback(() => {
    fetchCattle();
  }, [fetchCattle]);

  return {
    // State
    query,
    filters,
    sortOptions,
    cattle,
    loading,
    error,
    pagination,
    
    // Actions
    setQuery,
    setFilters,
    setSortOptions,
    resetFilters,
    search,
    goToPage,
    refetch
  };
};

export default useSearch;