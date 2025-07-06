import '@testing-library/jest-dom/vitest';
import { beforeAll, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

beforeAll(() => {
  // Ensure we're using test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must run in test environment');
  }
});

// Mock only the hooks we need while preserving actual implementation
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

// Add any global test setup here

// Alias jest -> vi for backward compatibility with older test files
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.jest = vi;

// Generic stub user & auth context
const mockUser = { name: 'Test User', crm: '1234', uf: 'RN' };

vi.mock('@/contexts/auth/AuthContext', () => {
  return {
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      logout: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock('@/contexts/AuthContext', async (importOriginal) => {
  // fallback to previous path
  const mod = await importOriginal();
  return {
    ...mod,
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      logout: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Notifications context stub
vi.mock('@/contexts/NotificationContext', () => {
  return {
    useNotifications: () => ({
      unreadCount: 0,
      notifications: [],
      markAllAsRead: vi.fn(),
    }),
    NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Stub Supabase Edge function invoke during unit tests
// @ts-ignore
if (!supabase.functions) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  supabase.functions = { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) };
} else {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  supabase.functions.invoke = vi.fn().mockResolvedValue({ data: {}, error: null });
}
