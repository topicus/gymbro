# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

Gymbro is a React + TypeScript fitness tracking app with gamification (XP, streaks, chapters). It uses Vite, Tailwind CSS, Supabase for auth/database, and OpenAI for an AI coach chat feature.

### Key Patterns

**Mock Mode**: When Supabase credentials are missing, the app runs in mock mode with in-memory storage (`src/lib/mockData.ts`). This enables local development without a database. Check `isMockMode` from `src/lib/supabase.ts`.

**Path Alias**: Use `@/` to import from `src/` (configured in vite.config.ts and tsconfig.json).

**Data Flow**: App.tsx is the central orchestrator - it initializes all hooks and passes data/callbacks down to pages. State is managed via custom hooks in `src/hooks/`:
- `useAuth` - Authentication state and methods
- `useProfile` - User profile CRUD
- `useChapters` - Training chapters (goals with duration/focus)
- `useCheckIns` - Daily check-in tracking

**Chapters System**: Users have training "chapters" with focus types (drainage/strength/maintenance). Only one chapter can be active at a time - activating one pauses others.

### Environment Variables

Copy `.env.example` to `.env`:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` - Supabase project credentials
- `VITE_OPENAI_API_KEY` - For AI chat feature (runs client-side in MVP)

### Database

Schema is in `supabase-schema.sql`. Tables: `profiles`, `chapters`, `daily_check_ins`. All have RLS policies requiring `auth.uid() = user_id`.
