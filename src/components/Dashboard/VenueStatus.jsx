import React, { useEffect, useState } from 'react';
import { subscribeToVenueData, subscribeToStadiumData } from '../../services/dataService';
import { useVenueContext } from '../../context/VenueContext';
import './VenueStatus.css';
import { Utensils, Droplets, LogOut, Clock, Users } from 'lucide-react';

const VenueStatus = () => {
  const { selectedStadium } = useVenueContext();
  const [data, setData] = useState({ food_courts: [], washrooms: [], gates: [] });

  useEffect(() => {
    // Use stadium-aware subscription; maps 'gates' key from stadiumData
    const unsubscribe = subscribeToStadiumData(selectedStadium, (newData) => {
      setData({
        food_courts: newData.food_courts || [],
        washrooms: newData.washrooms || [],
        gates: newData.gates || [],
      });
    });
    return () => unsubscribe();
  }, [selectedStadium]);

  const renderBadge = (level) => {
    let colorClass = 'badge-low';
    if (level === 'High') colorClass = 'badge-high';
    if (level === 'Medium') colorClass = 'badge-medium';

    return <span className={`badge ${colorClass}`}>{level}</span>;
  };

  return (
    <div className="venue-status-container animate-fade-in">
      <h2 className="section-title">Live Venue Status</h2>
      
      <div className="status-grid">
        {/* Food Courts */}
        <div className="status-category glass">
          <div className="category-header">
            <Utensils className="category-icon" />
            <h3>Food & Dining</h3>
          </div>
          <div className="items-list">
            {data.food_courts.map(fc => (
              <div key={fc.id} className="status-item">
                <div className="item-main">
                  <span className="item-name">{fc.name}</span>
                  {renderBadge(fc.crowdLevel)}
                </div>
                <div className="item-meta">
                  <span className="flex-center"><Clock size={14}/> {fc.waitTime}m wait</span>
                  <span>Dist: {fc.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Washrooms */}
        <div className="status-category glass">
          <div className="category-header">
            <Droplets className="category-icon" />
            <h3>Washrooms</h3>
          </div>
          <div className="items-list">
            {data.washrooms.map(wr => (
              <div key={wr.id} className="status-item">
                <div className="item-main">
                  <span className="item-name">{wr.name}</span>
                  {renderBadge(wr.crowdLevel)}
                </div>
                <div className="item-meta">
                  <span className="flex-center"><Users size={14}/> {wr.queue} in queue</span>
                  <span>Dist: {wr.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gates */}
        <div className="status-category glass">
          <div className="category-header">
            <LogOut className="category-icon" />
            <h3>Exits</h3>
          </div>
          <div className="items-list">
            {data.gates.map(gate => (
              <div key={gate.id} className="status-item">
                <div className="item-main">
                  <span className="item-name">{gate.name}</span>
                  {renderBadge(gate.crowdLevel)}
                </div>
                <div className="item-meta">
                  <span className="flex-center"><Clock size={14}/> {gate.waitTime}m wait</span>
                  <span>Dist: {gate.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueStatus;
