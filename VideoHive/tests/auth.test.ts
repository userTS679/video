import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
      update: jest.fn(() => ({ eq: jest.fn() })),
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn() })) })),
    })),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

describe('Authentication Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user account', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      (supabase.auth.signUp as jest.MockedFunction<any>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabase.from as jest.MockedFunction<any>).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const store = useAuthStore.getState();
      
      await expect(store.signUp('test@example.com', 'password123')).resolves.not.toThrow();
      
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: undefined,
        },
      });
    });

    it('should handle signup errors', async () => {
      (supabase.auth.signUp as jest.MockedFunction<any>).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid email' },
      });

      const store = useAuthStore.getState();
      
      await expect(store.signUp('invalid-email', 'password123')).rejects.toEqual({
        message: 'Invalid email',
      });
    });
  });

  describe('signIn', () => {
    it('should sign in existing user', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      (supabase.auth.signInWithPassword as jest.MockedFunction<any>).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const store = useAuthStore.getState();
      
      await expect(store.signIn('test@example.com', 'password123')).resolves.not.toThrow();
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle signin errors', async () => {
      (supabase.auth.signInWithPassword as jest.MockedFunction<any>).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const store = useAuthStore.getState();
      
      await expect(store.signIn('test@example.com', 'wrongpassword')).rejects.toEqual({
        message: 'Invalid credentials',
      });
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      (supabase.auth.signOut as jest.MockedFunction<any>).mockResolvedValue({
        error: null,
      });

      const store = useAuthStore.getState();
      
      await expect(store.signOut()).resolves.not.toThrow();
      
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });
});