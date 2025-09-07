// Groq AI integration for moderation and icebreakers

export interface GroqModerationRequest {
  content: string;
  type: 'text' | 'image';
  userId?: string;
}

export interface GroqModerationResponse {
  safe: boolean;
  confidence: number;
  categories: string[];
  reason?: string;
  actionRequired: 'none' | 'review' | 'block';
}

export interface GroqIcebreakerRequest {
  userAInterests: string[];
  userBInterests: string[];
  context?: string;
  language?: string;
}

export interface GroqIcebreakerResponse {
  icebreakers: string[];
  confidence: number;
}

// Mock implementations for development
export const mockModeration = async (request: GroqModerationRequest): Promise<GroqModerationResponse> => {
  // Simple mock moderation
  const flaggedWords = ['spam', 'inappropriate', 'fake'];
  const containsFlagged = flaggedWords.some(word => 
    request.content.toLowerCase().includes(word)
  );

  return {
    safe: !containsFlagged,
    confidence: containsFlagged ? 0.9 : 0.1,
    categories: containsFlagged ? ['spam'] : [],
    reason: containsFlagged ? 'Contains flagged content' : undefined,
    actionRequired: containsFlagged ? 'review' : 'none',
  };
};

export const mockIcebreakerGeneration = async (request: GroqIcebreakerRequest): Promise<GroqIcebreakerResponse> => {
  const commonInterests = request.userAInterests.filter(interest => 
    request.userBInterests.includes(interest)
  );

  const fallbackIcebreakers = [
    "What's your favorite way to spend a weekend?",
    "If you could travel anywhere right now, where would you go?",
    "What's something you're passionate about?",
    "What's the best piece of advice you've ever received?",
    "What's your favorite type of music or movie?",
  ];

  const contextualIcebreakers = commonInterests.length > 0 
    ? [`I see we both like ${commonInterests[0]}! What got you into it?`]
    : [];

  return {
    icebreakers: [...contextualIcebreakers, ...fallbackIcebreakers.slice(0, 3)],
    confidence: 0.8,
  };
};

// Real Groq integration functions (to be implemented with actual API)
export const moderateContent = async (request: GroqModerationRequest): Promise<GroqModerationResponse> => {
  // TODO: Implement real Groq API call
  // For now, use mock implementation
  return mockModeration(request);
};

export const generateIcebreakers = async (request: GroqIcebreakerRequest): Promise<GroqIcebreakerResponse> => {
  // TODO: Implement real Groq API call
  // For now, use mock implementation
  return mockIcebreakerGeneration(request);
};

export const generateSuggestedReplies = async (context: string): Promise<string[]> => {
  // TODO: Implement real Groq API call for suggested replies
  return [
    "That sounds interesting! Tell me more.",
    "I can relate to that!",
    "That's cool! I've never tried that before.",
  ];
};