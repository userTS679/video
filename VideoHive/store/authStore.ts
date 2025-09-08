import { create } from 'zustand';
import { supabase, User } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // options: {},
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            display_name: data.user.email?.split('@')[0] || 'User',
            selfie_verified: false,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
        else {
  console.log('Profile created successfully');
}
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
      await get().initialize(); // <-- Added to update auth state after signup
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
      await get().initialize(); // <-- Added to update auth state after signin
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) throw new Error('No user found');

    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      set({ user: { ...user, ...updates } });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

initialize: async () => {
  try {
    set({ isLoading: true });
    console.log('[Auth] init - env token?', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'yes' : 'no');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[Auth] currentSession:', session);

    if (session?.user) {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      console.log('[Auth] profile:', profile);

      if (!error && profile) {
        set({
          user: profile,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('[Auth] set authenticated');
        return;
      }
    }

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    console.log('[Auth] set unauthenticated');
  } catch (error) {
    console.error('[Auth] Initialize error:', error);
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    console.log('[Auth] set unauthenticated (error)');
  }
},
}));

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const { initialize } = useAuthStore.getState();

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await initialize();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
          isLoading: false
    });
  }
});