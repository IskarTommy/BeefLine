import axios, { type AxiosResponse } from 'axios';
import type { 
  User, 
  Cattle, 
  LoginFormData, 
  RegisterFormData, 
  ApiResponse, 
  PaginatedResponse, 
  SearchFilters, 
  SortOptions
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('authToken', access);
          
          processQueue(null, access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  login: async (credentials: LoginFormData): Promise<ApiResponse<{ user: User; access: string; refresh: string }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User; access: string; refresh: string }>> = 
      await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData: RegisterFormData): Promise<ApiResponse<{ user: User; access: string; refresh: string }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User; access: string; refresh: string }>> = 
      await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.post('/auth/logout/');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ access: string }>> => {
    const response: AxiosResponse<ApiResponse<{ access: string }>> = 
      await api.post('/auth/refresh/', { refresh: refreshToken });
    return response.data;
  }
};

// User API functions
export const userAPI = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get('/users/profile/');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.put('/users/profile/', userData);
    return response.data;
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.post('/users/change-password/', passwordData);
    return response.data;
  },

  requestVerification: async (): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.post('/users/request-verification/');
    return response.data;
  },

  getUserCattle: async (userId: string): Promise<ApiResponse<Cattle[]>> => {
    const response: AxiosResponse<ApiResponse<Cattle[]>> = await api.get(`/users/${userId}/cattle/`);
    return response.data;
  }
};

// Cattle API functions
export const cattleAPI = {
  getCattle: async (
    filters?: SearchFilters, 
    sort?: SortOptions, 
    page: number = 1, 
    limit: number = 12
  ): Promise<PaginatedResponse<Cattle>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    if (sort) {
      params.append('sort', `${sort.direction === 'desc' ? '-' : ''}${sort.field}`);
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: AxiosResponse<PaginatedResponse<Cattle>> = 
      await api.get(`/cattle/?${params.toString()}`);
    return response.data;
  },

  getCattleById: async (id: string): Promise<ApiResponse<Cattle>> => {
    const response: AxiosResponse<ApiResponse<Cattle>> = await api.get(`/cattle/${id}/`);
    return response.data;
  },

  createCattle: async (cattleData: Omit<Cattle, 'id' | 'seller' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Cattle>> => {
    const response: AxiosResponse<ApiResponse<Cattle>> = await api.post('/cattle/', cattleData);
    return response.data;
  },

  updateCattle: async (id: string, cattleData: Partial<Cattle>): Promise<ApiResponse<Cattle>> => {
    const response: AxiosResponse<ApiResponse<Cattle>> = await api.put(`/cattle/${id}/`, cattleData);
    return response.data;
  },

  deleteCattle: async (id: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.delete(`/cattle/${id}/`);
    return response.data;
  },

  uploadCattleImages: async (cattleId: string, images: FormData): Promise<ApiResponse<{ images: string[] }>> => {
    const response: AxiosResponse<ApiResponse<{ images: string[] }>> = 
      await api.post(`/cattle/${cattleId}/images/`, images, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data;
  }
};

export default api;