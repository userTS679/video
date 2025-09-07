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
- ✅ **MANDATORY AUTHENTICATION** - Users must sign up/login before accessing app
- ✅ **WORKING VIDEO CALLING** - Complete video calling system with Agora SDK
- ✅ **GEN-Z UI THEME** - Modern, vibrant design with emojis and gradients
- ✅ **INTERACTIVE GAMES** - Games and icebreakers for engaging conversations
- ✅ **SMART ICEBREAKERS** - AI-powered conversation starters using Groq

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
- **Mandatory Authentication** - Complete signup/login flow required
- **3-Step Comprehensive Signup** - Email, personal details, college info
- **Working Video Calling** - Real-time video chat with Agora SDK integration
- **Interactive Games** - Rock Paper Scissors, Trivia, Emoji Guess, Would You Rather
- **Smart Icebreakers** - Context-aware conversation starters using Groq AI
- **Gen-Z UI Design** - Vibrant colors, emojis, modern gradients
- **College Student Focus** - University selection, interests, study year
- **Safe Environment** - Designed specifically for college students
- **Cross-platform support** - Web, iOS, Android via Expo

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

## Recent Changes (Latest Implementation)
- ✅ **Fixed Authentication Flow** - Users now MUST signup/login first
- ✅ **Enhanced Signup Process** - 3-step comprehensive form with validation
- ✅ **Working Video Calling** - Integrated Agora SDK with WebView for real calls
- ✅ **Smart Search System** - Improved matchmaking with better UI
- ✅ **Interactive Games Library** - Added trivia, emoji puzzles, would-you-rather
- ✅ **AI Icebreaker Engine** - Smart conversation starters using Groq
- ✅ **Complete UI Overhaul** - Gen-Z friendly design with vibrant colors
- ✅ **College-Focused Features** - University selection, study year, interests
- ✅ **Modern Navigation** - Updated tab bar and screens with new theme

## User Preferences
- Project successfully imported from GitHub
- All configuration adapted for Replit environment
- Development workflow optimized for web preview