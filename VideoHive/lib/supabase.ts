import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types based on our database schema
export interface User {
  id: string;
  email?: string;
  phone?: string;
  display_name: string;
  username?: string;
  date_of_birth?: string;
  gender?: string;
  pronouns?: string;
  bio?: string;
  interests?: string[];
  college?: string;
  location?: string;
  profile_photo_url?: string;
  selfie_verified: boolean;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_genders?: string[];
  preferred_age_min: number;
  preferred_age_max: number;
  preferred_locations?: string[];
  preferred_interests?: string[];
  languages?: string[];
  max_distance_km: number;
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: string;
  channel_name: string;
  caller_id: string;
  callee_id: string;
  status: 'waiting' | 'connecting' | 'connected' | 'ended' | 'reported' | 'canceled';
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  friend_press_caller: boolean;
  friend_press_callee: boolean;
  caller_rating?: number;
  callee_rating?: number;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_a_id: string;
  user_b_id: string;
  call_id?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachments?: any[];
  is_read: boolean;
  created_at: string;
}

export interface IcebreakerPrompt {
  id: string;
  prompt_text: string;
  categories?: string[];
  language: string;
  popularity_score: number;
  is_ai_generated: boolean;
  created_at: string;
}

export interface MiniGameSession {
  id: string;
  call_id: string;
  game_type: 'rock_paper_scissors' | 'trivia' | 'emoji_guess';
  game_state: any;
  game_result: any;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  category: string;
  difficulty: string;
  language: string;
  created_at: string;
}