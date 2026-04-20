import React from 'react';
import VenueStatus from './components/Dashboard/VenueStatus';
import AIChat from './components/AIChat/AIChat';
import MapSimulation from './components/Map/MapSimulation';
import StadiumSelector from './components/StadiumSelector/StadiumSelector';
import { VenueProvider } from './context/VenueContext';
import './App.css';

function App() {
  return (
    <VenueProvider>
      <div className="app-layout">
        <header className="app-header glass">
          <div className="logo-area">
            <div className="logo-dot pulse"></div>
            <h1>FlowMind AI</h1>
            <span className="badge badge-low ml-2">Live Connected</span>
          </div>
          <div className="header-right">
            <StadiumSelector />
            <p className="subtitle">Real-time Decision Intelligence</p>
          </div>
        </header>

        <main className="app-main">
          {/* Left Column: Dashboard & Map */}
          <div className="col-left">
            <VenueStatus />
            <MapSimulation />
          </div>

          {/* Right Column: AI Assistant */}
          <div className="col-right">
            <AIChat />
          </div>
        </main>
      </div>
    </VenueProvider>
  );
}

export default App;
