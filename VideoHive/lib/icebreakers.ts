// Smart icebreakers for college students using Groq API
import { generateIcebreakers } from './groq';

export const COLLEGE_ICEBREAKERS = [
  "What's your major and what made you choose it? 📚",
  "If you could have any superpower during exams, what would it be? ⚡",
  "What's the most interesting class you've taken this semester? 🤔",
  "Coffee or tea to survive those late-night study sessions? ☕",
  "What's your go-to stress relief activity during finals? 😅",
  "If you could swap lives with any fictional character for a day, who would it be? 🎭",
  "What's your favorite campus spot to hang out? 🏫",
  "What song always gets you hyped up? 🎵",
  "What's the weirdest food combination you actually enjoy? 🍕",
  "If you could only use one app for the rest of college, which would it be? 📱",
  "What's your biggest college achievement so far? 🏆",
  "Dream internship or job - what would it be? 💼",
  "What's something you've learned in college that they don't teach in textbooks? 🎓",
  "If you could design your perfect dorm room, what would it look like? 🏠",
  "What's your favorite late-night snack during study sessions? 🍿"
];

export const SITUATION_ICEBREAKERS = {
  awkward_silence: [
    "Quick! Tell me something that would surprise me about you! 😮",
    "What's the most random thing in your backpack right now? 🎒",
    "If you had to teach a class about anything, what would it be? 🎯",
    "What's your weirdest talent that nobody knows about? 🎪"
  ],
  long_pause: [
    "Let's play a quick game! Would you rather have the ability to fly or be invisible? ✈️",
    "Okay, rapid fire: Pizza or burgers? Netflix or YouTube? Morning or night person? 🔥",
    "What's the most embarrassing thing that happened to you this week? 😂",
    "If aliens visited Earth and asked you to recommend one thing about college life, what would it be? 👽"
  ],
  conversation_flowing: [
    "That's so cool! Speaking of that, what's something you're really passionate about? 💪",
    "I love that! What got you interested in that? 🌟",
    "That reminds me - what's on your bucket list for this year? 📝"
  ]
};

export interface IcebreakerContext {
  userInterests?: string[];
  partnerInterests?: string[];
  conversationDuration: number; // in seconds
  lastMessageTime: number; // timestamp
  messageCount: number;
  currentTopic?: string;
}

export class SmartIcebreakerEngine {
  private lastIcebreakerTime: number = 0;
  private usedIcebreakers: Set<string> = new Set();
  private conversationContext: IcebreakerContext;

  constructor(context: IcebreakerContext) {
    this.conversationContext = context;
  }

  shouldSuggestIcebreaker(): boolean {
    const now = Date.now();
    const timeSinceLastMessage = now - this.conversationContext.lastMessageTime;
    const timeSinceLastIcebreaker = now - this.lastIcebreakerTime;
    
    // Don't suggest too frequently
    if (timeSinceLastIcebreaker < 30000) return false; // 30 seconds
    
    // Suggest if there's been silence for more than 15 seconds
    if (timeSinceLastMessage > 15000) return true;
    
    // Suggest if conversation is flowing but needs a topic change
    if (this.conversationContext.messageCount > 10 && timeSinceLastMessage > 10000) return true;
    
    return false;
  }

  getContextualIcebreaker(): string {
    const now = Date.now();
    const timeSinceLastMessage = now - this.conversationContext.lastMessageTime;
    
    let pool: string[] = [];
    
    if (timeSinceLastMessage > 30000) {
      // Long silence - use awkward silence breakers
      pool = SITUATION_ICEBREAKERS.awkward_silence;
    } else if (timeSinceLastMessage > 15000) {
      // Medium pause - use long pause breakers
      pool = SITUATION_ICEBREAKERS.long_pause;
    } else {
      // Conversation flowing - use flowing breakers
      pool = SITUATION_ICEBREAKERS.conversation_flowing;
    }
    
    // Filter out used icebreakers
    const availableIcebreakers = pool.filter(icebreaker => !this.usedIcebreakers.has(icebreaker));
    
    // If all used, reset and use college icebreakers
    if (availableIcebreakers.length === 0) {
      this.usedIcebreakers.clear();
      pool = COLLEGE_ICEBREAKERS;
    }
    
    const selected = availableIcebreakers[Math.floor(Math.random() * availableIcebreakers.length)];
    this.usedIcebreakers.add(selected);
    this.lastIcebreakerTime = now;
    
    return selected;
  }

  async getAIIcebreaker(): Promise<string> {
    try {
      // Only use Groq API for special cases to avoid unnecessary calls
      if (this.conversationContext.userInterests && this.conversationContext.partnerInterests) {
        const response = await generateIcebreakers({
          userAInterests: this.conversationContext.userInterests,
          userBInterests: this.conversationContext.partnerInterests,
        });
        
        if (response.icebreakers && response.icebreakers.length > 0) {
          return response.icebreakers[0];
        }
      }
    } catch (error) {
      console.log('Using fallback icebreaker instead of AI');
    }
    
    // Fallback to contextual icebreaker
    return this.getContextualIcebreaker();
  }

  updateContext(updates: Partial<IcebreakerContext>) {
    this.conversationContext = { ...this.conversationContext, ...updates };
  }
}

export function createIcebreakerEngine(context: IcebreakerContext): SmartIcebreakerEngine {
  return new SmartIcebreakerEngine(context);
}