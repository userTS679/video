# ChillConnect - Gen-Z Social Video App

A cross-platform social video calling app that combines random 1:1 video calling with mutual friend connections, built for Gen-Z users in India.

## Features

- 🎥 Random 1:1 video calling (Omegle style)
- 👫 Mutual friend opt-in system (Tinder/Bumble style)
- 🎮 In-call mini-games and icebreakers
- 🤖 AI-powered moderation and wingman features
- 🔒 Privacy-first with selfie verification
- 📱 Cross-platform (Web + iOS + Android)

## Tech Stack

- **Frontend**: Expo (React Native) + React Native Web + TypeScript + Zustand
- **Backend**: Supabase (Postgres, Auth, Realtime, Storage)
- **Video**: Agora SDK for real-time video calling
- **AI**: Groq for moderation and icebreaker generation
- **Deployment**: Expo for mobile, Vercel for web, Supabase Edge Functions

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Agora
EXPO_PUBLIC_AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.2-90b-text-preview

# Optional
JWT_SECRET=your_jwt_secret
SENTRY_DSN=your_sentry_dsn
```

## Quick Start

1. **Setup Supabase Project**
   - Create a new Supabase project
   - Run the SQL migrations from `supabase/migrations/`
   - Enable Row Level Security
   - Configure authentication providers

2. **Setup Agora**
   - Create an Agora project
   - Get your App ID and Certificate
   - Enable real-time messaging

3. **Setup Groq**
   - Get API key from Groq
   - Choose appropriate model for text generation

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Start Development**
   ```bash
   # Start Expo development server
   npm run dev
   
   # For web only
   npm run web
   
   # For iOS simulator
   npm run ios
   
   # For Android emulator  
   npm run android
   ```

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication flow
│   ├── (tabs)/            # Main app tabs
│   ├── calling/           # Video calling screens
│   └── chat/              # Chat screens
├── components/            # Reusable components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities and configurations
├── store/                 # Zustand state management
├── supabase/              # Database migrations and types
├── tests/                 # Unit and integration tests
└── api/                   # Serverless functions (if needed)
```

## Key Features Implementation

### 1. Authentication & Onboarding
- Email/phone signup via Supabase Auth
- Profile setup with interests and preferences
- Selfie verification for safety

### 2. Video Calling System
- Random matching based on filters
- Blurred preview with mutual confirmation
- Agora SDK for high-quality video/audio

### 3. Mini-Games
- Rock Paper Scissors
- Quick Trivia
- Emoji Guessing Game

### 4. Mutual Friend System
- Private friend button presses
- Only mutual presses create friendships
- No notifications for single-sided presses

### 5. AI Features
- Groq-powered icebreaker suggestions
- Automated content moderation
- AI wingman for conversation starters

### 6. Safety & Privacy
- Report and block functionality
- Automatic moderation pipeline
- Panic exit button
- Selfie verification

## Database Schema

The app uses the following main tables:
- `users` - User profiles and verification status
- `user_preferences` - Matching filters and preferences
- `calls` - Call history and friend press tracking
- `friendships` - Mutual friend relationships
- `conversations` & `messages` - Chat system
- `reports` - Safety reporting system

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Deployment

### Web Deployment
```bash
npm run build:web
# Deploy to Vercel/Netlify
```

### Mobile Deployment
```bash
# Build for app stores
npx eas build --platform all

# Submit to stores
npx eas submit --platform all
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and support, please open a GitHub issue or contact the development team.

---

Built with ❤️ for Gen-Z India