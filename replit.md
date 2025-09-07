# ChillConnect - Social Video App

## Overview
ChillConnect is a Gen-Z focused social video calling app that combines random 1:1 video calling (Omegle-style) with mutual friend connections (Tinder/Bumble-style). Built with Expo React Native for cross-platform compatibility with web support.

## Current State
- ✅ Expo React Native app set up and running
- ✅ Web development server configured on port 5000  
- ✅ Environment variables configured for Supabase, Agora, and Groq APIs
- ✅ Metro bundler configured with path aliases for @/ imports
- ✅ Production deployment configured for autoscale
- ✅ Dependencies installed and project building successfully

## Tech Stack
- **Frontend**: Expo React Native + React Native Web + TypeScript
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Video Calling**: Agora SDK
- **AI Features**: Groq API
- **Navigation**: Expo Router
- **Icons**: Lucide React Native

## Architecture
```
VideoHive/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app navigation tabs
│   ├── calling/           # Video calling interface
│   └── _layout.tsx        # Root layout with auth flow
├── hooks/                 # Custom React hooks
├── lib/                   # API clients and utilities
├── store/                 # Zustand state stores
├── supabase/              # Database migrations
└── tests/                 # Test files
```

## Key Features
- Random 1:1 video calling with Agora SDK
- Mutual friend system with private matching
- In-call mini-games (Rock Paper Scissors, Trivia)
- AI-powered icebreakers and moderation via Groq
- User authentication and profile management via Supabase
- Cross-platform support (Web, iOS, Android)

## Development
- Web app runs on http://localhost:5000 (port 5000)
- Hot reloading enabled for development
- Environment variables managed through Replit Secrets
- Metro bundler configured for web compatibility

## Deployment
- Configured for Replit autoscale deployment
- Build process: `npm run build:web` creates production bundle in `dist/`
- Serves static files using `serve` package
- All environment variables automatically available in production

## Recent Changes
- Fixed Metro configuration to resolve @/ path aliases  
- Configured web server to work with Replit's proxy environment
- Set up deployment configuration for production
- Successfully imported and configured all dependencies

## User Preferences
- Project successfully imported from GitHub
- All configuration adapted for Replit environment
- Development workflow optimized for web preview