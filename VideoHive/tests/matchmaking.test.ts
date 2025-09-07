import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
      delete: jest.fn(() => ({ eq: jest.fn() })),
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
      update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })) })),
    })),
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      })),
    },
  },
}));

import { useCallStore } from '@/store/callStore';
import { supabase } from '@/lib/supabase';

describe('Matchmaking System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startSearch', () => {
    it('should add user to matchmaking queue', async () => {
      const store = useCallStore.getState();
      
      await store.startSearch({ interests: ['music', 'gaming'] });
      
      expect(store.isSearching).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('matchmaking_queue');
    });

    it('should clear existing queue entries before adding new one', async () => {
      const store = useCallStore.getState();
      
      await store.startSearch({ interests: ['music'] });
      
      // Should delete existing entries first
      expect(supabase.from).toHaveBeenCalledWith('matchmaking_queue');
      
      const mockFrom = supabase.from as jest.MockedFunction<any>;
      const deleteCall = mockFrom.mock.results[0].value;
      expect(deleteCall.delete).toHaveBeenCalled();
    });
  });

  describe('stopSearch', () => {
    it('should remove user from queue and stop searching', async () => {
      const store = useCallStore.getState();
      
      // Start search first
      await store.startSearch({});
      expect(store.isSearching).toBe(true);
      
      // Stop search
      store.stopSearch();
      expect(store.isSearching).toBe(false);
    });
  });

  describe('joinCall', () => {
    it('should join a call with proper setup', async () => {
      const mockCall = {
        id: 'call-id',
        channel_name: 'test-channel',
        caller_id: 'caller-id',
        callee_id: 'test-user-id',
        status: 'waiting' as const,
        friend_press_caller: false,
        friend_press_callee: false,
        started_at: '2023-01-01',
        duration_seconds: 0,
        created_at: '2023-01-01',
      };

      // Mock other user profile fetch
      (supabase.from as jest.MockedFunction<any>).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'caller-id',
                display_name: 'Test User',
                email: 'test@example.com',
                selfie_verified: true,
                is_online: true,
                last_seen: '2023-01-01',
                created_at: '2023-01-01',
                updated_at: '2023-01-01',
              },
              error: null,
            }),
          }),
        }),
      });

      const store = useCallStore.getState();
      await store.joinCall(mockCall);

      expect(store.currentCall).toEqual(mockCall);
      expect(store.isInCall).toBe(true);
      expect(store.channelName).toBe('test-channel');
      expect(store.connectedUser).toBeTruthy();
    });
  });
});