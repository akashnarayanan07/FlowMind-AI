/**
 * VenueStatus.jsx
 * Live venue data dashboard for FlowMind AI.
 *
 * Displays real-time crowd levels, wait times, and queue lengths
 * across Food Courts, Washrooms, and Exits for the selected stadium.
 *
 * Features:
 * - Stadium-aware data subscription (mirrors Firebase onValue pattern)
 * - Trend indicators (up/down arrows) based on value changes
 * - "Best Right Now" highlight card per category
 * - Click-to-query: clicking an item pre-fills the AI chat
 * - Full ARIA accessibility (roles, labels, live regions)
 * - Accessibility badges for items with accessible routes
 */
import React, { useEffect, useState, useCallback, memo } from 'react';
import { subscribeToStadiumData } from '../../services/dataService';
import { getBestOption } from '../../services/stadiumData';
import { useVenueContext } from '../../context/VenueContext';
import { getTrend } from '../../utils/formatters';
import './VenueStatus.css';
import { Utensils, Droplets, LogOut, Clock, Users, Star, TrendingUp, TrendingDown, Minus, Accessibility } from 'lucide-react';

/**
 * Renders a crowd level badge with appropriate colour.
 * @param {{ level: string }} props
 */
const CrowdBadge = memo(({ level }) => {
  let colorClass = 'badge-low';
  if (level === 'High')   colorClass = 'badge-high';
  if (level === 'Medium') colorClass = 'badge-medium';
  if (level === 'Empty')  colorClass = 'badge-empty';
  return (
    <span className={`badge ${colorClass}`} aria-label={`Crowd level: ${level}`}>
      {level}
    </span>
  );
});
CrowdBadge.displayName = 'CrowdBadge';

/**
 * Renders a trend icon and delta based on previous vs current value.
 * @param {{ direction: string, delta: number }} props
 */
const TrendIcon = memo(({ direction, delta }) => {
  if (direction === 'up')
    return <span className="trend trend-up" aria-label={`Increased by ${delta}`}><TrendingUp size={12} /> +{delta}</span>;
  if (direction === 'down')
    return <span className="trend trend-down" aria-label={`Decreased by ${delta}`}><TrendingDown size={12} /> -{delta}</span>;
  return <span className="trend trend-stable" aria-label="Stable"><Minus size={12} /></span>;
});
TrendIcon.displayName = 'TrendIcon';

// ─── Main Component ──────────────────────────────────────────────────────────

const VenueStatus = () => {
  const { selectedStadium, setActiveCategory } = useVenueContext();
  const [data, setData] = useState({ food_courts: [], washrooms: [], gates: [] });
  const [prevData, setPrevData] = useState({ food_courts: [], washrooms: [], gates: [] });

  useEffect(() => {
    const unsubscribe = subscribeToStadiumData(selectedStadium, (newData) => {
      setData(prev => {
        setPrevData(prev); // Save previous data for trend calculation
        return {
          food_courts: newData.food_courts || [],
          washrooms:   newData.washrooms   || [],
          gates:       newData.gates       || [],
        };
      });
    });
    return () => unsubscribe();
  }, [selectedStadium]);

  /**
   * Handle click on a status item — set category filter and announce intent.
   * @param {'food'|'washrooms'|'exits'} category
   */
  const handleItemClick = useCallback((category) => {
    setActiveCategory(category);
  }, [setActiveCategory]);

  /**
   * Get trend data for an item by comparing with previous data.
   * @param {object} item
   * @param {'food'|'restroom'|'exit'} type
   * @param {Array} prevList
   * @returns {{ direction: string, delta: number }}
   */
  const getItemTrend = (item, metric, prevList) => {
    const prev = prevList?.find(p => p.id === item.id);
    if (!prev) return { direction: 'stable', delta: 0 };
    return getTrend(prev[metric], item[metric]);
  };

  const bestFood = getBestOption(data.food_courts, 'food');
  const bestWash = getBestOption(data.washrooms, 'restroom');
  const bestExit = getBestOption(data.gates, 'exit');

  return (
    <section
      className="venue-status-container animate-fade-in"
      aria-label={`Live venue status for Stadium ${selectedStadium}`}
    >
      <h2 className="section-title">Live Venue Status</h2>

      <div className="status-grid" role="list">

        {/* ── Food Courts ─────────────────────────────────────── */}
        <article
          className="status-category glass"
          role="listitem"
          aria-label="Food and dining options"
        >
          <div className="category-header">
            <Utensils className="category-icon" aria-hidden="true" />
            <h3>Food & Dining</h3>
            {bestFood && (
              <span className="best-label" aria-label={`Best option: ${bestFood.name}`}>
                <Star size={11} /> Best: {bestFood.name}
              </span>
            )}
          </div>
          <div className="items-list">
            {data.food_courts.map(fc => {
              const trend = getItemTrend(fc, 'waitTime', prevData.food_courts);
              const isBest = fc.id === bestFood?.id;
              return (
                <button
                  key={fc.id}
                  className={`status-item ${isBest ? 'status-item--best' : ''}`}
                  onClick={() => handleItemClick('food')}
                  aria-label={`${fc.name}, ${fc.waitTime} minute wait, ${fc.crowdLevel} crowd. ${fc.accessible ? 'Accessible.' : ''} Click to navigate.`}
                  title="Click to navigate to this location"
                >
                  <div className="item-main">
                    <div className="item-name-row">
                      <span className="item-name">{fc.name}</span>
                      {fc.accessible && (
                        <Accessibility size={12} className="access-icon" aria-label="Wheelchair accessible" title="Accessible" />
                      )}
                    </div>
                    <div className="item-badges">
                      <CrowdBadge level={fc.crowdLevel} />
                      {fc.rating && (
                        <span className="rating-badge" aria-label={`Rated ${fc.rating} out of 5`}>
                          ⭐ {fc.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="item-meta">
                    <span className="meta-item">
                      <Clock size={13} aria-hidden="true" />
                      {fc.waitTime}m wait
                      <TrendIcon {...trend} />
                    </span>
                    <span className="meta-item" aria-label={`Distance: ${fc.distance}`}>
                      📍 {fc.distance}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        {/* ── Washrooms ───────────────────────────────────────── */}
        <article
          className="status-category glass"
          role="listitem"
          aria-label="Washroom options"
        >
          <div className="category-header">
            <Droplets className="category-icon" aria-hidden="true" />
            <h3>Washrooms</h3>
            {bestWash && (
              <span className="best-label" aria-label={`Best option: ${bestWash.name}`}>
                <Star size={11} /> Best: {bestWash.name}
              </span>
            )}
          </div>
          <div className="items-list">
            {data.washrooms.map(wr => {
              const trend = getItemTrend(wr, 'queue', prevData.washrooms);
              const isBest = wr.id === bestWash?.id;
              return (
                <button
                  key={wr.id}
                  className={`status-item ${isBest ? 'status-item--best' : ''}`}
                  onClick={() => handleItemClick('washrooms')}
                  aria-label={`${wr.name}, ${wr.queue} people in queue, ${wr.crowdLevel} crowd. ${wr.accessible ? 'Accessible.' : ''} Click to navigate.`}
                  title="Click to navigate"
                >
                  <div className="item-main">
                    <div className="item-name-row">
                      <span className="item-name">{wr.name}</span>
                      {wr.accessible && (
                        <Accessibility size={12} className="access-icon" aria-label="Wheelchair accessible" title="Accessible" />
                      )}
                    </div>
                    <CrowdBadge level={wr.crowdLevel} />
                  </div>
                  <div className="item-meta">
                    <span className="meta-item">
                      <Users size={13} aria-hidden="true" />
                      {wr.queue} in queue
                      <TrendIcon {...trend} />
                    </span>
                    <span className="meta-item" aria-label={`Distance: ${wr.distance}`}>
                      📍 {wr.distance}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        {/* ── Gates / Exits ────────────────────────────────────── */}
        <article
          className="status-category glass"
          role="listitem"
          aria-label="Exit gate options"
        >
          <div className="category-header">
            <LogOut className="category-icon" aria-hidden="true" />
            <h3>Exits</h3>
            {bestExit && (
              <span className="best-label" aria-label={`Best option: ${bestExit.name}`}>
                <Star size={11} /> Best: {bestExit.name}
              </span>
            )}
          </div>
          <div className="items-list">
            {data.gates.map(gate => {
              const trend = getItemTrend(gate, 'waitTime', prevData.gates);
              const isBest = gate.id === bestExit?.id;
              return (
                <button
                  key={gate.id}
                  className={`status-item ${isBest ? 'status-item--best' : ''}`}
                  onClick={() => handleItemClick('exits')}
                  aria-label={`${gate.name}, ${gate.waitTime} minute wait, ${gate.crowdLevel} crowd. ${gate.accessible ? 'Accessible.' : ''} Click to navigate.`}
                  title="Click to navigate"
                >
                  <div className="item-main">
                    <div className="item-name-row">
                      <span className="item-name">{gate.name}</span>
                      {gate.accessible && (
                        <Accessibility size={12} className="access-icon" aria-label="Wheelchair accessible" title="Accessible" />
                      )}
                    </div>
                    <CrowdBadge level={gate.crowdLevel} />
                  </div>
                  <div className="item-meta">
                    <span className="meta-item">
                      <Clock size={13} aria-hidden="true" />
                      {gate.waitTime}m wait
                      <TrendIcon {...trend} />
                    </span>
                    <span className="meta-item" aria-label={`Distance: ${gate.distance}`}>
                      📍 {gate.distance}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

      </div>
    </section>
  );
};

export default VenueStatus;
