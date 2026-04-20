import React from 'react';
import { useVenueContext } from '../../context/VenueContext';
import { STADIUMS } from '../../services/stadiumData';
import './StadiumSelector.css';

const StadiumSelector = () => {
  const { selectedStadium, setSelectedStadium } = useVenueContext();

  const handleChange = (e) => {
    setSelectedStadium(e.target.value);
  };

  const currentStadium = STADIUMS[selectedStadium];

  return (
    <div className="stadium-selector-wrapper">
      <label className="stadium-label" htmlFor="stadium-select">
        <span className="stadium-icon">🏟️</span>
        <span>Venue</span>
      </label>
      <div className="stadium-select-group">
        <select
          id="stadium-select"
          className="stadium-select"
          value={selectedStadium}
          onChange={handleChange}
        >
          {Object.values(STADIUMS).map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <span
          className="stadium-tag"
          style={{ backgroundColor: currentStadium?.tagColor + '22', color: currentStadium?.tagColor, borderColor: currentStadium?.tagColor + '55' }}
        >
          {currentStadium?.tag}
        </span>
      </div>
    </div>
  );
};

export default StadiumSelector;
