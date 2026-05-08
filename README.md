# ShaunM12 AI Chat Interface

Developer-focused AI chat workspace built with Next.js and React, integrated with Groq and Meta Llama 3.

## Features

- Three-panel layout:
  - Left history panel for conversation search and navigation
  - Center chat panel for active conversation and message input
  - Right metrics panel for token usage, performance, and cost estimate
- Groq API integration through a Next.js route handler
- Meta Llama 3 model via Groq (`llama-3.3-70b-versatile`)
- Session persistence with localStorage
- Loading and error states for API calls
- Session token tracking:
	- Prompt tokens
	- Completion tokens
	- Total tokens
	- Tokens per second
	- Response times
	- Estimated session cost
- Emoji picker in the chat input
- Message reactions with count tracking
- Typing indicator channel (WebSocket-based) with user/peer typing states
- Message-level search inside the active chat
- User profile editor (display name, avatar emoji, bio)
- Profile-aware message rendering using sender avatar and name
- Visual empty-state graphic for chat onboarding
- Per-conversation Delete button in the history panel
- Light and dark theme toggle with icon labels (sun/moon)
- Theme preference persistence across refreshes
- Full theme-aware color system across panels, cards, inputs, and chat surfaces

## Architecture

- Componentized UI panels:
  - `app/components/HistoryPanel.tsx`
  - `app/components/ChatPanel.tsx`
  - `app/components/MetricsPanel.tsx`
- Workspace state and chat actions are centralized in:
  - `app/hooks/useChatWorkspace.ts`
- Hook barrel export:
  - `app/hooks/index.ts`
- Shared models and utilities:
  - `app/lib/chatModels.ts`
  - `app/lib/chatUtils.ts`
- Static visual assets:
  - `public/chat-visual.svg`

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Groq API
- WebSocket (typing signal channel)
- emoji-picker-react

## Environment Variables

Create a local environment file and provide your API key:

```bash
cp .env.local.example .env.local
```

Then set:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build For Production

```bash
npm run build
npm run start
```

## Deployment (Vercel)

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Add environment variable `GROQ_API_KEY` in Vercel project settings.
4. Deploy.

## Project Structure

- `app/page.tsx`: Main client-side chat workspace and state management
- `app/api/chat/route.ts`: Server route that calls Groq
- `app/components/`: UI panels for history, chat, and metrics
- `app/hooks/useChatWorkspace.ts`: Central state, side effects, API calls, search, reactions, typing signals, profile persistence, and delete-conversation actions
- `app/hooks/index.ts`: Hook barrel exports
- `app/lib/chatModels.ts`: Shared TypeScript models
- `app/lib/chatUtils.ts`: Shared constants and utility functions
- `public/chat-visual.svg`: Chat empty-state illustration
- `app/globals.css`: Dark developer-tool visual system
- `app/layout.tsx`: App shell metadata and global layout entry
- `next.config.mjs`: Next.js runtime config
- `.env.local.example`: Environment variable template

## Notes

- The API key is read from environment configuration and is not hardcoded.
- Conversation sessions are saved in localStorage and restored on refresh.
- User profile settings are also persisted locally.
- Theme preference is persisted locally and reapplied on load.
- Use the Clear Conversation control to reset current session data.
- Use the Delete button in the history panel to remove a specific conversation from history.
- Reactions and message search are session-local and saved with conversation state.