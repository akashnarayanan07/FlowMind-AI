import React, { useState, useEffect } from 'react';
import { Map, Navigation } from 'lucide-react';
import { useVenueContext } from '../../context/VenueContext';
import { subscribeToStadiumData } from '../../services/dataService';
import { getBestOption } from '../../services/stadiumData';
import './MapSimulation.css';

// Category configuration
const CATEGORIES = [
  { key: 'food',      label: 'Food',      emoji: '🍔', color: '#10b981' },
  { key: 'washrooms', label: 'Washrooms', emoji: '🚻', color: '#f59e0b' },
  { key: 'exits',     label: 'Exits',     emoji: '🚪', color: '#ef4444' },
];

const TYPE_TO_CATEGORY = {
  food: 'food',
  restroom: 'washrooms',
  exit: 'exits',
};

const MapSimulation = () => {
  const { selectedStadium, activeCategory, toggleCategory } = useVenueContext();
  const [stadiumData, setStadiumData] = useState(null);

  // Subscribe to live stadium data
  useEffect(() => {
    const unsub = subscribeToStadiumData(selectedStadium, (data) => {
      setStadiumData(data);
    });
    return unsub;
  }, [selectedStadium]);

  if (!stadiumData) return null;

  // Flatten all locations
  const allNodes = [
    ...stadiumData.food_courts.map(n => ({ ...n, cat: 'food' })),
    ...stadiumData.washrooms.map(n => ({ ...n, cat: 'washrooms' })),
    ...stadiumData.gates.map(n => ({ ...n, cat: 'exits' })),
  ];

  // Find the best node in the active category
  let bestNode = null;
  let bestNodes = [];
  if (activeCategory) {
    const catNodes = allNodes.filter(n => n.cat === activeCategory);
    bestNodes = catNodes;
    const type = activeCategory === 'food' ? 'food' : activeCategory === 'washrooms' ? 'restroom' : 'exit';
    bestNode = getBestOption(catNodes, type);
  }

  const userPos = stadiumData.userPos || { x: 45, y: 55 };

  // ETA label
  const etaLabel = bestNode
    ? `${bestNode.distance} to ${bestNode.name}`
    : null;

  // Category accent color
  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="map-container glass">
      <div className="map-header">
        <Map className="map-icon" />
        <h3>Live Venue Navigation</h3>
        <span className="map-stadium-badge">Stadium {selectedStadium}</span>
      </div>

      {/* Category Tabs */}
      <div className="map-category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`cat-tab ${activeCategory === cat.key ? 'cat-tab--active' : ''}`}
            style={activeCategory === cat.key ? { '--cat-color': cat.color } : {}}
            onClick={() => toggleCategory(cat.key)}
            title={`Show ${cat.label}`}
          >
            <span className="cat-tab-emoji">{cat.emoji}</span>
            <span className="cat-tab-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="map-placeholder">
        <div className="map-background"></div>

        {/* SVG Overlay — routes */}
        <svg className="map-overlay">
          {bestNode && (
            <line
              className="route-line-direct"
              x1={`${userPos.x}%`}
              y1={`${userPos.y}%`}
              x2={`${bestNode.x}%`}
              y2={`${bestNode.y}%`}
              stroke={activeCat?.color || 'var(--accent-primary)'}
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
          )}
          {/* Original static route when no category selected */}
          {!activeCategory && (
            <path
              className="route-line"
              d="M 160 180 Q 200 100 280 60"
              stroke="var(--accent-primary)"
              fill="none"
              strokeWidth="3"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* ALL location nodes */}
        {allNodes.map(node => {
          const cat = CATEGORIES.find(c => c.key === node.cat);
          const isActiveCategory = !activeCategory || node.cat === activeCategory;
          const isBest = bestNode && node.id === bestNode.id;
          const isDimmed = activeCategory && node.cat !== activeCategory;

          return (
            <div
              key={node.id}
              className={`node node-loc ${isDimmed ? 'node--dimmed' : ''} ${isBest ? 'node--best' : ''}`}
              style={{
                top: `${node.y}%`,
                left: `${node.x}%`,
                '--node-color': cat?.color || '#fff',
              }}
              title={node.name}
            >
              {isBest && <div className="best-ring"></div>}
              <span className="node-label">
                {isBest ? '⭐ ' : ''}{node.name}
                {node.waitTime != null ? ` (${node.waitTime}m)` : ''}
                {node.queue != null ? ` (${node.queue} in line)` : ''}
              </span>
            </div>
          );
        })}

        {/* User position — always visible */}
        <div className="node node-user" style={{ top: `${userPos.y}%`, left: `${userPos.x}%` }}>
          <div className="pulse-ring"></div>
          <span className="node-label">You</span>
        </div>

        {/* Bottom control bar */}
        <div className="map-controls">
          {etaLabel ? (
            <span className="control-item" style={{ color: activeCat?.color }}>
              <Navigation size={14} /> {etaLabel}
            </span>
          ) : (
            <span className="control-item">
              <Navigation size={14} /> Select a category above to navigate
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSimulation;
