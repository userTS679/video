import { create } from 'zustand';
import { supabase, MiniGameSession, TriviaQuestion } from '@/lib/supabase';

interface GameState {
  currentGame: MiniGameSession | null;
  isGameActive: boolean;
  gameType: 'rock_paper_scissors' | 'trivia' | 'emoji_guess' | null;
  gameState: any;
  triviaQuestions: TriviaQuestion[];
  
  // Actions
  startGame: (gameType: 'rock_paper_scissors' | 'trivia' | 'emoji_guess', callId: string) => Promise<void>;
  updateGameState: (newState: any) => Promise<void>;
  endGame: (result: any) => Promise<void>;
  loadTriviaQuestions: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  isGameActive: false,
  gameType: null,
  gameState: null,
  triviaQuestions: [],

  startGame: async (gameType, callId) => {
    try {
      const initialState = getInitialGameState(gameType);
      
      const { data: gameSession, error } = await supabase
        .from('mini_game_sessions')
        .insert({
          call_id: callId,
          game_type: gameType,
          game_state: initialState,
        })
        .select()
        .single();

      if (error) throw error;

      set({
        currentGame: gameSession,
        isGameActive: true,
        gameType,
        gameState: initialState,
      });

      // Load trivia questions if needed
      if (gameType === 'trivia') {
        await get().loadTriviaQuestions();
      }
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },

  updateGameState: async (newState) => {
    const { currentGame } = get();
    if (!currentGame) return;

    try {
      const { error } = await supabase
        .from('mini_game_sessions')
        .update({ game_state: newState })
        .eq('id', currentGame.id);

      if (error) throw error;

      set({ gameState: newState });
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  },

  endGame: async (result) => {
    const { currentGame } = get();
    if (!currentGame) return;

    try {
      const { error } = await supabase
        .from('mini_game_sessions')
        .update({
          game_result: result,
          ended_at: new Date().toISOString(),
        })
        .eq('id', currentGame.id);

      if (error) throw error;

      set({
        currentGame: null,
        isGameActive: false,
        gameType: null,
        gameState: null,
      });
    } catch (error) {
      console.error('Error ending game:', error);
      throw error;
    }
  },

  loadTriviaQuestions: async () => {
    try {
      const { data: questions, error } = await supabase
        .from('trivia_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      set({ triviaQuestions: questions || [] });
    } catch (error) {
      console.error('Error loading trivia questions:', error);
      throw error;
    }
  },
}));

// Game state initializers
const getInitialGameState = (gameType: string) => {
  switch (gameType) {
    case 'rock_paper_scissors':
      return {
        round: 1,
        maxRounds: 3,
        playerAChoice: null,
        playerBChoice: null,
        playerAScore: 0,
        playerBScore: 0,
        currentRoundWinner: null,
        gameWinner: null,
      };
    
    case 'trivia':
      return {
        currentQuestion: 0,
        totalQuestions: 3,
        playerAScore: 0,
        playerBScore: 0,
        playerAAnswers: [],
        playerBAnswers: [],
        questionStartTime: null,
        timePerQuestion: 10000, // 10 seconds
      };
    
    case 'emoji_guess':
      return {
        currentWord: '',
        emojis: [],
        guesserGuess: '',
        hostId: null,
        guesserId: null,
        timeLimit: 30000, // 30 seconds
        startTime: null,
        isCorrect: false,
      };
    
    default:
      return {};
  }
};