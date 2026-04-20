# FlowMind AI — Real-Time Venue Decision Assistant

**FlowMind AI** is a smart, context-aware decision-making assistant designed for large event venues. It goes beyond a simple chatbot — it maintains live context about venue conditions (crowds, wait times, queue lengths) and the user's selected location to recommend the **best** choices dynamically.

Powered by **Google Gemini 2.0 Flash** with multi-turn conversation memory.

---

## Chosen Vertical

**Smart Event & Venue Navigation** — Helping event attendees make data-driven, real-time decisions about food, washrooms, and exits across multi-stadium venues.

---

## Features

| Feature | Description |
|---------|-------------|
| 🤖 **Gemini 2.0 Flash AI** | Uses the latest Gemini model with multi-turn chat history for follow-up awareness |
| 🏟️ **4 Unique Stadiums** | A (Balanced), B (Dense Amenities), C (Exit-Heavy), D (VIP Premium) |
| 📡 **Real-Time Simulation** | Observer pattern mirrors Firebase Realtime DB — data updates every 3s and 60s |
| 🗺️ **Interactive Map** | Category-aware SVG map with best-option highlighting and animated routes |
| 🎙️ **Voice Input** | Web Speech API for hands-free venue queries |
| 🔊 **Text-to-Speech** | Toggle AI voice responses via the Web Speech Synthesis API |
| 🚨 **Alert System** | Real-time toast notifications when crowd spikes are detected |
| ♿ **Accessibility** | ARIA roles, live regions, skip navigation, keyboard navigation, focus indicators |
| 🛡️ **Security** | Input sanitization, rate limiting (10 req/min), API key validation, safety settings |
| 🧪 **Tests** | 30+ unit tests across utilities and data services using Vitest |
| 📋 **Quick Prompts** | One-tap suggested questions for new users |
| 📈 **Trend Indicators** | Up/down arrows showing real-time changes in wait times and queue lengths |

---

## Architecture

```
src/
├── components/
│   ├── AIChat/          # Conversational AI interface (multi-turn, voice, TTS)
│   ├── AlertBanner/     # Real-time toast notifications for crowd spikes
│   ├── Dashboard/       # Live venue status with trend indicators
│   ├── ErrorBoundary/   # Graceful error handling for each section
│   ├── Map/             # Interactive SVG map with category filtering
│   └── StadiumSelector/ # Venue switcher (A/B/C/D)
├── context/
│   └── VenueContext.jsx # Global state: selected stadium + active category
├── services/
│   ├── aiService.js     # Gemini 2.0 API routing + mock fallback
│   ├── dataService.js   # Observer-pattern real-time simulation
│   └── stadiumData.js   # Static venue datasets (4 stadiums)
├── tests/
│   ├── security.test.js     # Tests for sanitiseInput, rateLimit, apiKey validation
│   ├── formatters.test.js   # Tests for markdown parser, trend, formatDuration
│   └── stadiumData.test.js  # Data integrity + getBestOption logic tests
└── utils/
    ├── security.js      # Input sanitization, rate limiting, key validation
    └── formatters.js    # Markdown parser, trend detection, ID generation
```

---

## How the Solution Works

### 1. Real-Time Data Layer

`dataService.js` simulates **Firebase Realtime Database** using an observer pattern:
- Components call `subscribeToStadiumData(stadiumId, callback)` — just like `onValue(ref, snapshot => …)`.
- Two simulation intervals run in parallel:
  - **Fast (3s):** Food court wait times and gate congestion fluctuate.
  - **Slow (60s):** Washroom queues drain gradually with 12% chance of half-time spikes.
- When a spike exceeds 50% of the previous value, the **Alert System** fires a toast notification.

### 2. AI Decision Engine (`aiService.js`)

```
User Query → sanitizeInput() → checkRateLimit()
           → getCurrentStadiumContext()
           → buildSystemInstruction(stadium, category, context)
           → Gemini 2.0 Flash (with chatHistory for multi-turn)
           → truncateResponse()
           → Rendered in chat with markdown formatting
```

**Multi-turn memory:** Each exchange is appended to `chatHistory` in `{role, parts}` format and passed to `model.startChat({ history })`, giving Gemini full conversation context.

**Mock fallback:** When `VITE_GEMINI_API_KEY` is absent, `generateMockResponse()` applies the same decision logic deterministically — sorting by composite score `(waitTime + crowdPenalty × 3)`.

### 3. Decision Intelligence

The AI is forced by its system prompt to:
- **Compare ≥ 2 options** quantitatively using real numbers from live data.
- **Recommend exactly one** using `**Recommended: <name>.**` markdown bold.
- **Prioritise lowest total friction** (wait time + travel distance) holistically.
- **Stay scoped** to the user's active category (food / washrooms / exits).

### 4. Accessibility

- `role="main"`, `role="log"`, `role="alert"`, `role="banner"`, `role="contentinfo"` landmarks throughout.
- `aria-live="polite"` on AI messages; `aria-live="assertive"` on alert toasts.
- Skip-to-content link for keyboard users.
- All interactive elements have descriptive `aria-label` attributes.
- Focus-visible outlines on all buttons and inputs.
- Wheelchair-accessible item indicators via `accessible` flag in data.

---

## Google Services Integration

| Service | How It's Used |
|---------|--------------|
| **Google Gemini 2.0 Flash** | Core AI model for decision-making via `@google/generative-ai` SDK |
| **Google Fonts (Inter + Outfit)** | Typography loaded via Google Fonts CDN |
| **Safety Settings** | Gemini safety filters applied (`BLOCK_MEDIUM_AND_ABOVE`) for responsible AI |

---

## Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

### With Real Gemini AI

1. Create `.env` in the project root:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
2. Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Restart the dev server.

> **Without a key**, the app runs a deterministic mock AI engine that follows identical decision logic.

### Run Tests

```bash
npm test
```

---

## Assumptions Made

1. **Single-venue session:** Users are assumed to be at one of the 4 stadiums at a time. Multi-location tracking is not implemented.
2. **Simulated data:** Wait times and queue lengths are simulated locally. In production, these would come from **Firebase Realtime Database** with IoT sensor feeds.
3. **Browser APIs:** Voice input (Web Speech API) requires Chrome or Edge. TTS uses browser-native SpeechSynthesis.
4. **No authentication:** The app is designed as a public-facing attendee tool — user auth is out of scope.
5. **Gemini quota:** Rate limiting is applied client-side (10 req/min) as a first line of defence; server-side quota applies independently.

---

## Security Measures

- All user input passes through `sanitizeInput()` — strips HTML, injection characters, and limits to 500 chars.
- Client-side rate limit: 10 AI queries per minute per browser session.
- API key never logged or exposed in UI.
- Gemini safety settings block harmful content at medium threshold.
- Error messages never expose internal system state or stack traces.

---

*Built with React + Vite + Google Gemini 2.0 Flash*
