// Interactive games for video calls
export interface GameState {
  gameType: 'rock_paper_scissors' | 'trivia' | 'emoji_guess' | 'would_you_rather';
  currentRound: number;
  maxRounds: number;
  playerScores: { [playerId: string]: number };
  gameData: any;
  isActive: boolean;
}

export const TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: "Which social media platform was originally called 'The Facebook'?",
    options: ["Instagram", "Facebook", "Twitter", "Snapchat"],
    correct: 1,
    category: "tech"
  },
  {
    id: 2,
    question: "What does 'CPU' stand for in computer terms?",
    options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
    correct: 0,
    category: "tech"
  },
  {
    id: 3,
    question: "Which streaming service created 'Stranger Things'?",
    options: ["Hulu", "Amazon Prime", "Netflix", "Disney+"],
    correct: 2,
    category: "entertainment"
  },
  {
    id: 4,
    question: "What's the most popular programming language for beginners?",
    options: ["Java", "Python", "C++", "JavaScript"],
    correct: 1,
    category: "tech"
  },
  {
    id: 5,
    question: "Which app is known for its 15-second videos?",
    options: ["TikTok", "Instagram", "YouTube", "Vine"],
    correct: 0,
    category: "social"
  }
];

export const EMOJI_PUZZLES = [
  {
    id: 1,
    emojis: "🍕🏠",
    answer: "Pizza Hut",
    hint: "Fast food restaurant"
  },
  {
    id: 2,
    emojis: "⭐💰",
    answer: "Starbucks",
    hint: "Coffee chain"
  },
  {
    id: 3,
    emojis: "🐦📱",
    answer: "Twitter",
    hint: "Social media platform"
  },
  {
    id: 4,
    emojis: "🎬🌟",
    answer: "Movie Star",
    hint: "Hollywood celebrity"
  },
  {
    id: 5,
    emojis: "🎓📚",
    answer: "Study",
    hint: "What students do"
  }
];

export const WOULD_YOU_RATHER_QUESTIONS = [
  {
    id: 1,
    optionA: "Have the ability to read minds",
    optionB: "Have the ability to become invisible",
    category: "superpowers"
  },
  {
    id: 2,
    optionA: "Never have to study again but get average grades",
    optionB: "Study hard and get excellent grades",
    category: "college"
  },
  {
    id: 3,
    optionA: "Live without music",
    optionB: "Live without movies/TV",
    category: "entertainment"
  },
  {
    id: 4,
    optionA: "Be able to time travel to the past",
    optionB: "Be able to time travel to the future",
    category: "time"
  },
  {
    id: 5,
    optionA: "Have unlimited money but no friends",
    optionB: "Have amazing friends but be broke",
    category: "life"
  }
];

export function getRandomTrivia() {
  return TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
}

export function getRandomEmojiPuzzle() {
  return EMOJI_PUZZLES[Math.floor(Math.random() * EMOJI_PUZZLES.length)];
}

export function getRandomWouldYouRather() {
  return WOULD_YOU_RATHER_QUESTIONS[Math.floor(Math.random() * WOULD_YOU_RATHER_QUESTIONS.length)];
}

export function createGameState(gameType: GameState['gameType'], maxRounds: number = 3): GameState {
  return {
    gameType,
    currentRound: 1,
    maxRounds,
    playerScores: {},
    gameData: null,
    isActive: true,
  };
}