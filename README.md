# Endless Tales — AI-Powered Text Adventure with Multiplayer Co-op

Endless Tales is a browser-based, AI-driven text adventure game with support for solo play and WebRTC-based peer-to-peer cooperative multiplayer. It features dynamic AI narration, character progression, crafting, skill trees, and a fully host-authoritative multiplayer system.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Multiplayer Co-op](#multiplayer-co-op)
- [Contributing](#contributing)
- [License](#license)

## Features
All features below are fully implemented in the codebase:
- **Adventure Modes**: Three solo modes (Randomized, Custom, Immersed) plus Co-op P2P multiplayer (no enforced player limit)
  - **Randomized**: Fully random adventure generation with minimal setup
  - **Custom**: Define your own world settings (genre, magic system, tech level, tone, etc.)
  - **Immersed**: Play in existing fictional universes (e.g., Star Wars, Harry Potter, Lord of the Rings) as existing characters or original creations, with AI-generated character profiles
  - **Co-op**: Host/join P2P sessions with manual QR code/invite code signalling
- **6 AI Providers**: Google Gemini, OpenAI, Anthropic Claude, DeepSeek, OpenRouter, and local browser-based WebLLM (no API key required)
- **Dynamic Character System**: Stat allocation (STR/STA/WIS), class selection, AI-generated character descriptions, XP progression, and leveling
- **AI-Driven Gameplay**: Dynamic narration, adventure generation, skill tree creation, action difficulty assessment, and adventure summarization
- **Progression Systems**: Crafting, skill trees, world map with discoverable locations, inventory management, NPC relationships, and faction reputation
- **Save/Load System**: Local browser storage with schema versioning for backwards compatibility
- **Customization**: UI themes (dark/light mode, 6+ prebuilt themes), configurable adventure settings (genre, magic system, tech level, narrative tone)
- **Multiplayer Features**: Real-time chat, player trading, turn-based host-authoritative gameplay, party management, and manual P2P signalling via QR codes or invite codes

## Tech Stack
- **Framework**: Next.js 16.2.3 (React 18, TypeScript 5+)
- **State Management**: React Context API with `useReducer`, split into modular sub-reducers (adventure, character, inventory, multiplayer, settings)
- **AI Integration**: `@google/genai` for cloud providers, `@mlc-ai/webllm` for local models, custom AI router for multi-provider support
- **UI**: Radix UI headless components, Tailwind CSS v3, shadcn/ui component library, Lucide icons
- **Multiplayer**: Native WebRTC with manual SDP signalling, 5 dedicated data channels (game-actions, story-update, party-state, chat, control)
- **Utilities**: Zod for schema validation, react-hook-form for forms, `jsonrepair` for AI response handling, `dice-roller` for in-game dice roll calculations

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- Package manager: npm, yarn, or pnpm
- Modern browser with WebGPU support for local WebLLM models (Chrome 113+, Edge 113+)

### Installation
```bash
git clone https://github.com/DarkKitty-w/Endless-Tales.git
cd Endless-Tales
npm install
```

### Environment Variables
Create a `.env.local` file in the project root with the following keys (only required for cloud AI providers, WebLLM needs no keys):
| Variable | Description | Required For |
|----------|-------------|--------------|
| `GEMINI_API_KEY` | Google Gemini API key | Gemini provider |
| `OPENAI_API_KEY` | OpenAI API key | OpenAI provider |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Claude provider |
| `DEEPSEEK_API_KEY` | DeepSeek API key | DeepSeek provider |
| `OPENROUTER_API_KEY` | OpenRouter API key | OpenRouter provider |

API keys are stored only in sessionStorage and cleared when the browser tab is closed.

### Development
Start the Next.js development server with Turbopack:
```bash
npm run dev
```
The app will be available at **http://localhost:9002**.

### Production Build
```bash
npm run build
npm start
```

### AI Proxy
Cloud AI requests for Gemini, OpenAI, Claude, DeepSeek, and OpenRouter are routed through the built-in Next.js API route at `src/app/api/ai-proxy/route.ts` — WebLLM runs locally and requires no proxy. No separate proxy server is required.

## Usage

### Main Menu
After starting the app, choose from four adventure types:
1. **Randomized Adventure**: Jump into a fully random adventure (goes directly to character creation)
2. **Custom Adventure**: Configure your world settings (genre, magic system, tech level, etc.) before creating your character
3. **Immersed Adventure**: Enter an existing universe name (e.g., "Star Wars") and play as an existing character or create an original one
4. **Co-op Adventure**: Access the Co-op Lobby to host a new session or join an existing one via invite code/QR code

### Adventure Setup
Depending on your chosen mode:
- **Custom**: Fill in world details (genre, magic system, tech level, etc.), then proceed to character creation
- **Immersed**: Enter universe name and character details, with AI generating your character profile automatically
- **Randomized**: Proceed directly to character creation after optional difficulty/permanent death settings

## Architecture Overview
Endless Tales uses a client-first architecture with host-authoritative multiplayer:
1. **State Management**: Central `GameContext` uses a main reducer split into 5 sub-reducers, with actions defined in `game-actions.ts`.
2. **AI Integration**: `ai-router.ts` routes requests to the selected provider, with cloud requests proxied through the Next.js API route to protect API keys.
3. **Multiplayer**: Host creates a WebRTC session with a base64-encoded SDP offer (shared via QR code or copy-paste). Guests join with an SDP answer, using STUN servers for NAT traversal. The host acts as the authoritative game master for all players.
4. **Persistence**: Adventure state is saved to localStorage with schema versioning for backwards compatibility.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser UI    │────▶│  GameContext    │────▶│  AI Router     │
│ (React/Next.js) │     │ (Reducer State) │     │ (Multi-Provider)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  WebRTC P2P     │     │  LocalStorage   │     │ Cloud / WebLLM  │
│ (Manual Signal) │     │  (Save/Load)    │     │ (AI Providers)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Project Structure
```
Endless-Tales/
├── src/
│   ├── ai/                 # AI integration
│   │   ├── flows/          # Genkit-style AI flows (narration, crafting, skill trees)
│   │   ├── schemas/        # Zod validation schemas for AI responses
│   │   ├── ai-instance.ts  # AI client initialization
│   │   └── ai-router.ts    # Multi-provider routing logic
│   ├── app/                # Next.js app router
│   │   ├── api/            # API routes (AI proxy)
│   │   ├── favicon.ico     # Site favicon
│   │   ├── globals.css     # Global styles and theme variables
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main entry point
│   ├── components/         # React components
│   │   ├── ErrorBoundary.tsx # Error boundary component
│   │   ├── character/      # Character creation forms
│   │   ├── gameplay/       # Core gameplay UI (narration, chat, actions)
│   │   ├── game/           # Game display components (map, inventory, skill trees)
│   │   ├── icons/          # Custom icons (HandDrawnIcons.tsx)
│   │   ├── screens/        # Full-page screens (main menu, coop lobby, gameplay)
│   │   └── ui/             # shadcn/ui generic components
│   ├── context/            # State management
│   │   ├── reducers/       # Modular sub-reducers
│   │   ├── GameContext.tsx # Main context provider
│   │   ├── game-actions.ts # Action definitions
│   │   ├── game-initial-state.ts # Initial game state
│   │   ├── game-reducer.ts # Main game reducer
│   │   └── game-state-utils.ts # State utility functions
│   ├── hooks/              # Custom hooks (use-multiplayer, use-mobile, use-toast)
│   ├── lib/                # Utilities
│   │   ├── webrtc-signalling.ts # WebRTC SDP handling
│   │   ├── firebase.ts     # Firebase config (unused for signalling)
│   │   ├── gameUtils.ts    # Game logic utilities
│   │   ├── themes.ts       # UI theme definitions
│   │   └── constants.ts    # App-wide constants
│   ├── services/           # Services (multiplayer service)
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Multiplayer Co-op
Endless Tales uses **pure P2P WebRTC with no signalling server or Firebase dependency**:
1. **Host**: Creates a session and generates a base64-encoded SDP offer (shared via QR code or copy-paste)
2. **Guest**: Imports the offer, generates an SDP answer, and shares it back with the host
3. **Connection**: Uses Google STUN servers for NAT traversal, with 5 dedicated data channels for game state, chat, and control
4. **Gameplay**: Host acts as the authoritative game master; all players take turns, with real-time chat and player-to-player trading
5. **Reconnection**: Automatic reconnection logic for disconnected peers

## Contributing
Contributions are welcome! Please follow these guidelines:
- All work must be done on the `community` branch
- Submit pull requests to the `main` branch
- The `main` branch is protected; PRs require review
- Follow the existing code style and TypeScript best practices

See [CONTRIBUTING.md](CONTRIBUTING.md) for basic contribution guidelines.

## License
Released under the [MIT License](LICENSE). Copyright 2025 DarkKitty-w.