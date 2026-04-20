# FlowMind AI

FlowMind AI is a smart, real-time decision-making assistant designed for large event venues. It goes beyond a simple chatbot by maintaining context about venue conditions (crowds, wait times) and user location to recommend the *best* choices dynamically.

## Features

1. **Conversational AI**: Uses the Gemini API (or a robust mock fallback) to understand intent and offer actionable guidance.
2. **Context Awareness**: The AI is injected with real-time venue state before every decision.
3. **Decision Intelligence**: Forces the AI to compare at least 2 options logically, factoring in distance and dynamically changing wait times.
4. **Real-time Data Simulation**: Built to mirror Firebase Realtime DB, the `dataService.js` simulates live traffic updates across the venue.
5. **Interactive Interface**: Modern, glassmorphism design using Vanilla CSS. Includes a mock map visualization.
6. **Voice Input (WOW Factor)**: Integrated Web Speech API for hands-free queries (e.g. "Where should I eat?").

## Development Setup

```bash
npm install
npm run dev
```

## Prompt Design and Logic

The core intelligence of FlowMind is derived from prompt engineering within `src/services/aiService.js`.

### 1. Data Injection (Context)
Before querying Gemini, we grab a snapshot of the live venue state (distances, queues, crowd levels). This JSON is appended directly into the system prompt.

### 2. Constraints (Rules)
The System Prompt enforces strict rules to guarantee "Decision Intelligence":
- **"Compare at least 2 relevant options"**: Ensures the AI doesn't just state the closest option, but evaluates alternatives.
- **"Recommend the BEST option holistically"**: Trade-offs between wait time and distance are evaluated.
- **"Short, human-like... use markdown"**: Keeps the UI clean and the output punchy, specifically bolding the `**Recommended: ...**` choice.

### 3. Mock Fallback
If `VITE_GEMINI_API_KEY` is not provided in a `.env` file, the app seamlessly falls back to a simulated LLM parser that mimics these exact same rules using string matching and sorting logic.

## Environment Variables

To use real Gemini AI:
1. Create a `.env` file in the root directory.
2. Add: `VITE_GEMINI_API_KEY=your_key_here`
