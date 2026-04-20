/**
 * App.jsx
 * Root application component for FlowMind AI.
 *
 * Integrates:
 *  - VenueProvider for global stadium/category state
 *  - ErrorBoundary around each major section
 *  - AlertBanner for real-time congestion notifications
 *  - Skip navigation link for keyboard accessibility
 *  - Semantic landmark structure (header, main, nav)
 */
import React from 'react';
import VenueStatus from './components/Dashboard/VenueStatus';
import AIChat from './components/AIChat/AIChat';
import MapSimulation from './components/Map/MapSimulation';
import StadiumSelector from './components/StadiumSelector/StadiumSelector';
import AlertBanner from './components/AlertBanner/AlertBanner';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { VenueProvider } from './context/VenueContext';
import './App.css';

/**
 * App component — primary layout shell.
 * Wraps all feature areas in individual ErrorBoundaries so
 * a crash in one section does not take down the whole page.
 */
function App() {
  return (
    <VenueProvider>
      {/* Skip-to-content link for keyboard & screen reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Real-time alert toasts — rendered at root so they float above all content */}
      <ErrorBoundary>
        <AlertBanner />
      </ErrorBoundary>

      <div className="app-layout">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="app-header glass" role="banner">
          <div className="logo-area">
            <div
              className="logo-dot pulse"
              role="img"
              aria-label="Live data indicator — blinking green dot"
            />
            <h1>FlowMind AI</h1>
            <span className="badge badge-low ml-2" aria-live="polite" aria-label="Status: Live Connected">
              Live Connected
            </span>
          </div>

          <div className="header-right">
            <ErrorBoundary>
              <StadiumSelector />
            </ErrorBoundary>
            <p className="subtitle" aria-label="Application tagline">
              Real-time Decision Intelligence
            </p>
          </div>
        </header>

        {/* ── Main Content ────────────────────────────────────── */}
        <main id="main-content" className="app-main" role="main" aria-label="FlowMind AI dashboard">

          {/* Left Column: Dashboard & Map */}
          <div className="col-left">
            <ErrorBoundary>
              <VenueStatus />
            </ErrorBoundary>
            <ErrorBoundary>
              <MapSimulation />
            </ErrorBoundary>
          </div>

          {/* Right Column: AI Concierge Chat */}
          <div className="col-right">
            <ErrorBoundary>
              <AIChat />
            </ErrorBoundary>
          </div>

        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="app-footer" role="contentinfo" aria-label="Application footer">
          <span>FlowMind AI &copy; {new Date().getFullYear()} &mdash; Powered by Google Gemini</span>
        </footer>

      </div>
    </VenueProvider>
  );
}

export default App;
