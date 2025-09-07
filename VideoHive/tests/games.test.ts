import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
      update: jest.fn(() => ({ eq: jest.fn() })),
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';

describe('Mini-Games System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rock Paper Scissors', () => {
    it('should initialize game with correct state', async () => {
      const store = useGameStore.getState();
      
      (supabase.from as jest.MockedFunction<any>).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'game-id',
                call_id: 'call-id',
                game_type: 'rock_paper_scissors',
                game_state: {
                  round: 1,
                  maxRounds: 3,
                  playerAChoice: null,
                  playerBChoice: null,
                  playerAScore: 0,
                  playerBScore: 0,
                },
                started_at: '2023-01-01',
                created_at: '2023-01-01',
              },
              error: null,
            }),
          }),
        }),
      });

      await store.startGame('rock_paper_scissors', 'call-id');

      expect(store.isGameActive).toBe(true);
      expect(store.gameType).toBe('rock_paper_scissors');
      expect(store.gameState).toEqual({
        round: 1,
        maxRounds: 3,
        playerAChoice: null,
        playerBChoice: null,
        playerAScore: 0,
        playerBScore: 0,
        currentRoundWinner: null,
        gameWinner: null,
      });
    });

    it('should update game state correctly', async () => {
      const store = useGameStore.getState();
      
      // Mock successful update
      (supabase.from as jest.MockedFunction<any>).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const newState = {
        round: 1,
        playerAChoice: 'rock',
        playerBChoice: 'scissors',
        playerAScore: 1,
        playerBScore: 0,
      };

      await store.updateGameState(newState);

      expect(store.gameState).toEqual(newState);
      expect(supabase.from).toHaveBeenCalledWith('mini_game_sessions');
    });
  });

  describe('Trivia Game', () => {
    it('should load trivia questions', async () => {
      const mockQuestions = [
        {
          id: '1',
          question: 'What is the capital of India?',
          options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
          correct_answer: 'Delhi',
          category: 'geography',
          difficulty: 'easy',
          language: 'english',
          created_at: '2023-01-01',
        },
      ];

      (supabase.from as jest.MockedFunction<any>).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockQuestions,
              error: null,
            }),
          }),
        }),
      });

      const store = useGameStore.getState();
      await store.loadTriviaQuestions();

      expect(store.triviaQuestions).toEqual(mockQuestions);
      expect(supabase.from).toHaveBeenCalledWith('trivia_questions');
    });

    it('should initialize trivia game with correct state', async () => {
      const store = useGameStore.getState();
      
      (supabase.from as jest.MockedFunction<any>).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'trivia-game-id',
                call_id: 'call-id',
                game_type: 'trivia',
                game_state: {
                  currentQuestion: 0,
                  totalQuestions: 3,
                  playerAScore: 0,
                  playerBScore: 0,
                  timePerQuestion: 10000,
                },
                started_at: '2023-01-01',
                created_at: '2023-01-01',
              },
              error: null,
            }),
          }),
        }),
      });

      await store.startGame('trivia', 'call-id');

      expect(store.gameType).toBe('trivia');
      expect(store.gameState.totalQuestions).toBe(3);
      expect(store.gameState.timePerQuestion).toBe(10000);
    });
  });

  describe('Emoji Guess Game', () => {
    it('should initialize emoji guess game with correct state', async () => {
      const store = useGameStore.getState();
      
      (supabase.from as jest.MockedFunction<any>).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'emoji-game-id',
                call_id: 'call-id',
                game_type: 'emoji_guess',
                game_state: {
                  currentWord: '',
                  emojis: [],
                  timeLimit: 30000,
                  hostId: null,
                  guesserId: null,
                },
                started_at: '2023-01-01',
                created_at: '2023-01-01',
              },
              error: null,
            }),
          }),
        }),
      });

      await store.startGame('emoji_guess', 'call-id');

      expect(store.gameType).toBe('emoji_guess');
      expect(store.gameState.timeLimit).toBe(30000);
    });
  });

  describe('endGame', () => {
    it('should properly end a game session', async () => {
      const store = useGameStore.getState();
      
      // Set up a mock current game
      store.currentGame = {
        id: 'game-id',
        call_id: 'call-id',
        game_type: 'rock_paper_scissors',
        game_state: {},
        game_result: {},
        started_at: '2023-01-01',
        created_at: '2023-01-01',
      };

      (supabase.from as jest.MockedFunction<any>).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const gameResult = { winner: 'player', score: '2-1' };
      await store.endGame(gameResult);

      expect(store.currentGame).toBeNull();
      expect(store.isGameActive).toBe(false);
      expect(store.gameType).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('mini_game_sessions');
    });
  });
});