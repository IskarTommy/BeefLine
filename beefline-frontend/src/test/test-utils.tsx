import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { User } from '../types';

// Mock AuthContext for testing
interface MockAuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
  clearError: ReturnType<typeof vi.fn>;
}

// Create a mock context
import { createContext } from 'react';

export const MockAuthContext = createContext<MockAuthContextValue | undefined>(undefined);

interface TestProvidersProps {
  children: ReactNode;
  user?: User | null;
  isLoading?: boolean;
}

export function TestProviders({ children, user = null, isLoading = false }: TestProvidersProps) {
  const mockAuthValue: MockAuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
    clearError: vi.fn(),
  };

  return (
    <BrowserRouter>
      <MockAuthContext.Provider value={mockAuthValue}>
        {children}
      </MockAuthContext.Provider>
    </BrowserRouter>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null;
  isLoading?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  { user, isLoading, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <TestProviders user={user} isLoading={isLoading}>
        {children}
      </TestProviders>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
