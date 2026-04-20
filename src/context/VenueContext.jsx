import React, { createContext, useContext, useState } from 'react';

const VenueContext = createContext(null);

export const VenueProvider = ({ children }) => {
  const [selectedStadium, setSelectedStadium] = useState('A');
  const [activeCategory, setActiveCategory] = useState(null); // 'food' | 'washrooms' | 'exits' | null

  const toggleCategory = (cat) => {
    setActiveCategory(prev => (prev === cat ? null : cat));
  };

  return (
    <VenueContext.Provider value={{
      selectedStadium,
      setSelectedStadium,
      activeCategory,
      setActiveCategory,
      toggleCategory,
    }}>
      {children}
    </VenueContext.Provider>
  );
};

export const useVenueContext = () => {
  const ctx = useContext(VenueContext);
  if (!ctx) throw new Error('useVenueContext must be used within VenueProvider');
  return ctx;
};

export default VenueContext;
