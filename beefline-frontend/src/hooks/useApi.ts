import { useState, useEffect } from 'react';
import api from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
}

export const useApi = <T>(
  url: string,
  options: UseApiOptions = { immediate: true }
) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api.get<T>(url);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      });
    }
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [url, options.immediate]);

  return {
    ...state,
    refetch: execute,
  };
};