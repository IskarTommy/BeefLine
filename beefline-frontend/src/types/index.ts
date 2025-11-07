// Core data models for the Beefline application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  region: string;
  userType: 'seller' | 'buyer';
  isVerified: boolean;
  createdAt: Date;
}

export interface CattleImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  documentType: 'health_certificate' | 'vaccination_record';
  uploadedAt: Date;
}

export interface Cattle {
  id: string;
  breed: 'West African Shorthorn' | 'Zebu' | 'Sanga';
  age: number; // in months
  weight: number; // in kg
  price: number; // in Ghana Cedis
  healthNotes: string;
  vaccinationStatus: boolean;
  feedingHistory: string;
  region: string;
  images: CattleImage[];
  healthCertificates: Document[];
  seller: User;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  region: string;
  userType: 'seller' | 'buyer';
}

// Search and filter types
export interface SearchFilters {
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  region?: string;
  minAge?: number;
  maxAge?: number;
  minWeight?: number;
  maxWeight?: number;
  vaccinationStatus?: boolean;
}

export interface SortOptions {
  field: 'price' | 'age' | 'weight' | 'createdAt';
  direction: 'asc' | 'desc';
}

// Search-related types
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'breed' | 'region' | 'recent' | 'popular';
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
}

export interface SearchState {
  query: string;
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  isLoading: boolean;
}