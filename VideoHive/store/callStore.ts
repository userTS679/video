import { create } from 'zustand';
import { supabase, Call, User } from '@/lib/supabase';
import { generateChannelName } from '@/lib/agora';

interface CallState {
  currentCall: Call | null;
  isInCall: boolean;
  isSearching: boolean;
  connectedUser: User | null;
  channelName: string | null;
  agoraToken: string | null;
  friendPressed: boolean;
  otherUserFriendPressed: boolean;
  currentIcebreaker: string | null;
  
  // Actions
  startSearch: (filters?: any) => Promise<void>;
  stopSearch: () => void;
  joinCall: (call: Call) => Promise<void>;
  endCall: () => Promise<void>;
  pressFriend: () => Promise<void>;
  reportUser: (reason: string, description?: string) => Promise<void>;
  setCurrentIcebreaker: (icebreaker: string) => void;
  updateCallStatus: (status: Call['status']) => Promise<void>;
}

export const useCallStore = create<CallState>((set, get) => ({
  currentCall: null,
  isInCall: false,
  isSearching: false,
  connectedUser: null,
  channelName: null,
  agoraToken: null,
  friendPressed: false,
  otherUserFriendPressed: false,
  currentIcebreaker: null,

  startSearch: async (filters = {}) => {
    set({ isSearching: true });
    
    try {
      // Add user to matchmaking queue
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');

      const userId = sessionData.session.user.id;
      
      // Clear any existing queue entries for this user
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', userId);

      // Add to queue
      await supabase
        .from('matchmaking_queue')
        .insert({
          user_id: userId,
          preferences: filters,
        });

      // Start polling for matches (in a real app, use realtime subscriptions)
      const pollForMatch = async () => {
        try {
          const { data: calls } = await supabase
            .from('calls')
            .select('*, caller:users!calls_caller_id_fkey(*), callee:users!calls_callee_id_fkey(*)')
            .or(`caller_id.eq.${userId},callee_id.eq.${userId}`)
            .eq('status', 'waiting')
            .order('created_at', { ascending: false })
            .limit(1);

          if (calls && calls.length > 0) {
            const call = calls[0];
            set({ isSearching: false });
            await get().joinCall(call);
            return;
          }

          // Continue polling if still searching
          if (get().isSearching) {
            setTimeout(pollForMatch, 2000);
          }
        } catch (error) {
          console.error('Error polling for match:', error);
          if (get().isSearching) {
            setTimeout(pollForMatch, 2000);
          }
        }
      };

      // Start polling
      setTimeout(pollForMatch, 1000);
      
    } catch (error) {
      console.error('Error starting search:', error);
      set({ isSearching: false });
      throw error;
    }
  },

  stopSearch: () => {
    set({ isSearching: false });
    
    // Remove from queue
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData.session) {
        supabase
          .from('matchmaking_queue')
          .delete()
          .eq('user_id', sessionData.session.user.id);
      }
    });
  },

  joinCall: async (call: Call) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');

      const userId = sessionData.session.user.id;
      const isCallee = call.callee_id === userId;
      const otherUserId = isCallee ? call.caller_id : call.callee_id;

      // Get other user's profile
      const { data: otherUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', otherUserId)
        .single();

      // TODO: Get Agora token from server
      const mockToken = `mock_token_${call.channel_name}_${userId}`;

      set({
        currentCall: call,
        isInCall: true,
        connectedUser: otherUser,
        channelName: call.channel_name,
        agoraToken: mockToken,
        friendPressed: isCallee ? call.friend_press_callee : call.friend_press_caller,
        otherUserFriendPressed: isCallee ? call.friend_press_caller : call.friend_press_callee,
      });

      // Update call status to connected
      await get().updateCallStatus('connected');
      
    } catch (error) {
      console.error('Error joining call:', error);
      throw error;
    }
  },

  endCall: async () => {
    const { currentCall } = get();
    if (!currentCall) return;

    try {
      // Update call end time and status
      await supabase
        .from('calls')
        .update({
          ended_at: new Date().toISOString(),
          status: 'ended',
        })
        .eq('id', currentCall.id);

      set({
        currentCall: null,
        isInCall: false,
        connectedUser: null,
        channelName: null,
        agoraToken: null,
        friendPressed: false,
        otherUserFriendPressed: false,
        currentIcebreaker: null,
      });
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  },

  pressFriend: async () => {
    const { currentCall } = get();
    if (!currentCall || get().friendPressed) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');

      const userId = sessionData.session.user.id;
      const isCallee = currentCall.callee_id === userId;
      
      // Update friend press status
      const updateData = isCallee 
        ? { friend_press_callee: true }
        : { friend_press_caller: true };

      const { data, error } = await supabase
        .from('calls')
        .update(updateData)
        .eq('id', currentCall.id)
        .select()
        .single();

      if (error) throw error;

      set({ 
        friendPressed: true,
        currentCall: data,
      });
    } catch (error) {
      console.error('Error pressing friend:', error);
      throw error;
    }
  },

  reportUser: async (reason: string, description?: string) => {
    const { currentCall, connectedUser } = get();
    if (!currentCall || !connectedUser) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');

      await supabase
        .from('reports')
        .insert({
          reporter_id: sessionData.session.user.id,
          reported_user_id: connectedUser.id,
          call_id: currentCall.id,
          reason: reason as any,
          description,
        });

      // End call after reporting
      await get().endCall();
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  },

  setCurrentIcebreaker: (icebreaker: string) => {
    set({ currentIcebreaker: icebreaker });
  },

  updateCallStatus: async (status: Call['status']) => {
    const { currentCall } = get();
    if (!currentCall) return;

    try {
      const { error } = await supabase
        .from('calls')
        .update({ status })
        .eq('id', currentCall.id);

      if (error) throw error;

      set({ 
        currentCall: { ...currentCall, status }
      });
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  },
}));