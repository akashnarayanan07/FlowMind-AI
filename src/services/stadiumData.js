/**
 * stadiumData.js
 * Separate mock datasets for Stadium A, B, and C.
 * Each location has x/y (percentages) for map rendering.
 */

export const STADIUMS = {
  A: {
    id: 'A',
    label: 'Stadium A',
    tag: 'Balanced',
    tagColor: '#3b82f6',
    userPos: { x: 45, y: 58 },
    food_courts: [
      { id: 'A_fc_1', name: 'Burger & Co (North)', type: 'food', waitTime: 3, crowdLevel: 'Low',    distance: '6 mins', rating: 4.5, x: 68, y: 20 },
      { id: 'A_fc_2', name: 'Food Court A',        type: 'food', waitTime: 15, crowdLevel: 'High',  distance: '2 mins', rating: 4.2, x: 22, y: 38 },
      { id: 'A_fc_3', name: 'Food Court B',        type: 'food', waitTime: 8,  crowdLevel: 'Medium',distance: '5 mins', rating: 3.8, x: 80, y: 55 },
    ],
    washrooms: [
      { id: 'A_wr_1', name: 'East Washroom',        type: 'restroom', queue: 12, crowdLevel: 'High',  distance: '1 min',  x: 78, y: 80 },
      { id: 'A_wr_2', name: 'West Washroom',        type: 'restroom', queue: 2,  crowdLevel: 'Low',   distance: '4 mins', x: 15, y: 72 },
      { id: 'A_wr_3', name: 'Upper Level Washroom', type: 'restroom', queue: 0,  crowdLevel: 'Empty', distance: '3 mins', x: 50, y: 15 },
    ],
    gates: [
      { id: 'A_g_1', name: 'Main Gate',  type: 'exit', waitTime: 25, crowdLevel: 'High', distance: '5 mins', x: 10, y: 50 },
      { id: 'A_g_2', name: 'North Exit', type: 'exit', waitTime: 5,  crowdLevel: 'Low',  distance: '8 mins', x: 50, y: 5  },
    ],
  },

  B: {
    id: 'B',
    label: 'Stadium B',
    tag: 'Dense Amenities',
    tagColor: '#10b981',
    userPos: { x: 50, y: 62 },
    food_courts: [
      { id: 'B_fc_1', name: 'The Grill Zone',      type: 'food', waitTime: 20, crowdLevel: 'High',   distance: '3 mins', rating: 4.0, x: 25, y: 25 },
      { id: 'B_fc_2', name: 'Noodle Bar East',     type: 'food', waitTime: 6,  crowdLevel: 'Low',    distance: '7 mins', rating: 4.3, x: 72, y: 18 },
      { id: 'B_fc_3', name: 'Snack Central',       type: 'food', waitTime: 10, crowdLevel: 'Medium', distance: '4 mins', rating: 3.5, x: 60, y: 45 },
      { id: 'B_fc_4', name: 'Pizza Express South', type: 'food', waitTime: 4,  crowdLevel: 'Low',    distance: '9 mins', rating: 4.6, x: 82, y: 70 },
    ],
    washrooms: [
      { id: 'B_wr_1', name: 'North Block WR',    type: 'restroom', queue: 8,  crowdLevel: 'Medium', distance: '2 mins', x: 40, y: 10 },
      { id: 'B_wr_2', name: 'South Block WR',    type: 'restroom', queue: 14, crowdLevel: 'High',   distance: '1 min',  x: 55, y: 85 },
      { id: 'B_wr_3', name: 'VIP Lounge WR',     type: 'restroom', queue: 0,  crowdLevel: 'Empty',  distance: '6 mins', x: 85, y: 30 },
      { id: 'B_wr_4', name: 'Gate B Washroom',   type: 'restroom', queue: 3,  crowdLevel: 'Low',    distance: '3 mins', x: 15, y: 60 },
    ],
    gates: [
      { id: 'B_g_1', name: 'Gate B Main',   type: 'exit', waitTime: 18, crowdLevel: 'High',  distance: '4 mins', x: 8,  y: 45 },
    ],
  },

  C: {
    id: 'C',
    label: 'Stadium C',
    tag: 'Exit-Heavy',
    tagColor: '#f59e0b',
    userPos: { x: 48, y: 55 },
    food_courts: [
      { id: 'C_fc_1', name: 'Fast Bites Corner', type: 'food', waitTime: 5,  crowdLevel: 'Low',    distance: '5 mins', rating: 3.9, x: 20, y: 30 },
      { id: 'C_fc_2', name: 'Stadium Eats',      type: 'food', waitTime: 22, crowdLevel: 'High',   distance: '2 mins', rating: 3.2, x: 65, y: 20 },
    ],
    washrooms: [
      { id: 'C_wr_1', name: 'Central Washroom', type: 'restroom', queue: 5,  crowdLevel: 'Medium', distance: '3 mins', x: 50, y: 30 },
      { id: 'C_wr_2', name: 'East Wing WR',     type: 'restroom', queue: 1,  crowdLevel: 'Low',    distance: '6 mins', x: 80, y: 50 },
    ],
    gates: [
      { id: 'C_g_1', name: 'Express Exit 1',  type: 'exit', waitTime: 2,  crowdLevel: 'Low',    distance: '3 mins', x: 10, y: 20 },
      { id: 'C_g_2', name: 'Express Exit 2',  type: 'exit', waitTime: 3,  crowdLevel: 'Low',    distance: '4 mins', x: 90, y: 20 },
      { id: 'C_g_3', name: 'VIP Exit Gate',   type: 'exit', waitTime: 1,  crowdLevel: 'Empty',  distance: '8 mins', x: 10, y: 80 },
      { id: 'C_g_4', name: 'South Exit Road', type: 'exit', waitTime: 8,  crowdLevel: 'Medium', distance: '5 mins', x: 90, y: 80 },
    ],
  },
};

/**
 * Returns a deep clone of a stadium's dataset so mutations don't affect the source.
 */
export const getStadiumSnapshot = (stadiumId) => {
  const stadium = STADIUMS[stadiumId];
  if (!stadium) return STADIUMS['A'];
  return JSON.parse(JSON.stringify(stadium));
};

/**
 * Returns the best option from a list based on score (lower wait + lower crowd = better).
 */
export const getBestOption = (items, type) => {
  if (!items || items.length === 0) return null;
  const crowdScore = { 'Empty': 0, 'Low': 1, 'Medium': 2, 'High': 3 };

  return [...items].sort((a, b) => {
    const aVal = (type === 'restroom' ? a.queue : a.waitTime) + (crowdScore[a.crowdLevel] || 0) * 3;
    const bVal = (type === 'restroom' ? b.queue : b.waitTime) + (crowdScore[b.crowdLevel] || 0) * 3;
    return aVal - bVal;
  })[0];
};
