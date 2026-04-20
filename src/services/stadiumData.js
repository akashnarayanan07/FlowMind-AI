/**
 * stadiumData.js
 * Static venue datasets for FlowMind AI — Stadiums A, B, C, and D.
 *
 * Each stadium entry includes:
 *  - Food courts with ratings, cuisine type, and price range
 *  - Washrooms with accessibility data
 *  - Exit gates with estimated wait times
 *  - x/y percentage coordinates for map overlay rendering
 *
 * Data is designed to reflect real-world diversity across venue types.
 */

/** @type {Record<string, StadiumData>} */
export const STADIUMS = {
  A: {
    id: 'A',
    label: 'Stadium A',
    tag: 'Balanced',
    tagColor: '#3b82f6',
    description: 'Main arena — balanced mix of food, washrooms, and exits.',
    userPos: { x: 45, y: 58 },
    capacity: 42000,
    food_courts: [
      {
        id: 'A_fc_1',
        name: 'Burger & Co (North)',
        type: 'food',
        cuisine: 'American',
        priceRange: '$$',
        waitTime: 3,
        crowdLevel: 'Low',
        distance: '6 mins',
        rating: 4.5,
        x: 68,
        y: 20,
        accessible: true,
      },
      {
        id: 'A_fc_2',
        name: 'Food Court A',
        type: 'food',
        cuisine: 'Multi-cuisine',
        priceRange: '$',
        waitTime: 15,
        crowdLevel: 'High',
        distance: '2 mins',
        rating: 4.2,
        x: 22,
        y: 38,
        accessible: true,
      },
      {
        id: 'A_fc_3',
        name: 'Food Court B',
        type: 'food',
        cuisine: 'Asian Fusion',
        priceRange: '$$',
        waitTime: 8,
        crowdLevel: 'Medium',
        distance: '5 mins',
        rating: 3.8,
        x: 80,
        y: 55,
        accessible: false,
      },
    ],
    washrooms: [
      {
        id: 'A_wr_1',
        name: 'East Washroom',
        type: 'restroom',
        queue: 12,
        crowdLevel: 'High',
        distance: '1 min',
        accessible: true,
        x: 78,
        y: 80,
      },
      {
        id: 'A_wr_2',
        name: 'West Washroom',
        type: 'restroom',
        queue: 2,
        crowdLevel: 'Low',
        distance: '4 mins',
        accessible: true,
        x: 15,
        y: 72,
      },
      {
        id: 'A_wr_3',
        name: 'Upper Level Washroom',
        type: 'restroom',
        queue: 0,
        crowdLevel: 'Empty',
        distance: '3 mins',
        accessible: false,
        x: 50,
        y: 15,
      },
    ],
    gates: [
      {
        id: 'A_g_1',
        name: 'Main Gate',
        type: 'exit',
        waitTime: 25,
        crowdLevel: 'High',
        distance: '5 mins',
        accessible: true,
        x: 10,
        y: 50,
      },
      {
        id: 'A_g_2',
        name: 'North Exit',
        type: 'exit',
        waitTime: 5,
        crowdLevel: 'Low',
        distance: '8 mins',
        accessible: true,
        x: 50,
        y: 5,
      },
    ],
  },

  B: {
    id: 'B',
    label: 'Stadium B',
    tag: 'Dense Amenities',
    tagColor: '#10b981',
    description: 'East wing — high density of food and washroom options.',
    userPos: { x: 50, y: 62 },
    capacity: 35000,
    food_courts: [
      {
        id: 'B_fc_1',
        name: 'The Grill Zone',
        type: 'food',
        cuisine: 'BBQ',
        priceRange: '$$$',
        waitTime: 20,
        crowdLevel: 'High',
        distance: '3 mins',
        rating: 4.0,
        x: 25,
        y: 25,
        accessible: true,
      },
      {
        id: 'B_fc_2',
        name: 'Noodle Bar East',
        type: 'food',
        cuisine: 'Asian',
        priceRange: '$$',
        waitTime: 6,
        crowdLevel: 'Low',
        distance: '7 mins',
        rating: 4.3,
        x: 72,
        y: 18,
        accessible: true,
      },
      {
        id: 'B_fc_3',
        name: 'Snack Central',
        type: 'food',
        cuisine: 'Snacks',
        priceRange: '$',
        waitTime: 10,
        crowdLevel: 'Medium',
        distance: '4 mins',
        rating: 3.5,
        x: 60,
        y: 45,
        accessible: false,
      },
      {
        id: 'B_fc_4',
        name: 'Pizza Express South',
        type: 'food',
        cuisine: 'Italian',
        priceRange: '$$',
        waitTime: 4,
        crowdLevel: 'Low',
        distance: '9 mins',
        rating: 4.6,
        x: 82,
        y: 70,
        accessible: true,
      },
    ],
    washrooms: [
      {
        id: 'B_wr_1',
        name: 'North Block WR',
        type: 'restroom',
        queue: 8,
        crowdLevel: 'Medium',
        distance: '2 mins',
        accessible: true,
        x: 40,
        y: 10,
      },
      {
        id: 'B_wr_2',
        name: 'South Block WR',
        type: 'restroom',
        queue: 14,
        crowdLevel: 'High',
        distance: '1 min',
        accessible: false,
        x: 55,
        y: 85,
      },
      {
        id: 'B_wr_3',
        name: 'VIP Lounge WR',
        type: 'restroom',
        queue: 0,
        crowdLevel: 'Empty',
        distance: '6 mins',
        accessible: true,
        x: 85,
        y: 30,
      },
      {
        id: 'B_wr_4',
        name: 'Gate B Washroom',
        type: 'restroom',
        queue: 3,
        crowdLevel: 'Low',
        distance: '3 mins',
        accessible: true,
        x: 15,
        y: 60,
      },
    ],
    gates: [
      {
        id: 'B_g_1',
        name: 'Gate B Main',
        type: 'exit',
        waitTime: 18,
        crowdLevel: 'High',
        distance: '4 mins',
        accessible: true,
        x: 8,
        y: 45,
      },
      {
        id: 'B_g_2',
        name: 'East Side Exit',
        type: 'exit',
        waitTime: 7,
        crowdLevel: 'Low',
        distance: '6 mins',
        accessible: true,
        x: 90,
        y: 50,
      },
    ],
  },

  C: {
    id: 'C',
    label: 'Stadium C',
    tag: 'Exit-Heavy',
    tagColor: '#f59e0b',
    description: 'West wing — optimised for quick exits. Multiple gate options.',
    userPos: { x: 48, y: 55 },
    capacity: 28000,
    food_courts: [
      {
        id: 'C_fc_1',
        name: 'Fast Bites Corner',
        type: 'food',
        cuisine: 'Fast Food',
        priceRange: '$',
        waitTime: 5,
        crowdLevel: 'Low',
        distance: '5 mins',
        rating: 3.9,
        x: 20,
        y: 30,
        accessible: true,
      },
      {
        id: 'C_fc_2',
        name: 'Stadium Eats',
        type: 'food',
        cuisine: 'Multi-cuisine',
        priceRange: '$$',
        waitTime: 22,
        crowdLevel: 'High',
        distance: '2 mins',
        rating: 3.2,
        x: 65,
        y: 20,
        accessible: true,
      },
    ],
    washrooms: [
      {
        id: 'C_wr_1',
        name: 'Central Washroom',
        type: 'restroom',
        queue: 5,
        crowdLevel: 'Medium',
        distance: '3 mins',
        accessible: true,
        x: 50,
        y: 30,
      },
      {
        id: 'C_wr_2',
        name: 'East Wing WR',
        type: 'restroom',
        queue: 1,
        crowdLevel: 'Low',
        distance: '6 mins',
        accessible: false,
        x: 80,
        y: 50,
      },
    ],
    gates: [
      {
        id: 'C_g_1',
        name: 'Express Exit 1',
        type: 'exit',
        waitTime: 2,
        crowdLevel: 'Low',
        distance: '3 mins',
        accessible: true,
        x: 10,
        y: 20,
      },
      {
        id: 'C_g_2',
        name: 'Express Exit 2',
        type: 'exit',
        waitTime: 3,
        crowdLevel: 'Low',
        distance: '4 mins',
        accessible: true,
        x: 90,
        y: 20,
      },
      {
        id: 'C_g_3',
        name: 'VIP Exit Gate',
        type: 'exit',
        waitTime: 1,
        crowdLevel: 'Empty',
        distance: '8 mins',
        accessible: true,
        x: 10,
        y: 80,
      },
      {
        id: 'C_g_4',
        name: 'South Exit Road',
        type: 'exit',
        waitTime: 8,
        crowdLevel: 'Medium',
        distance: '5 mins',
        accessible: false,
        x: 90,
        y: 80,
      },
    ],
  },

  D: {
    id: 'D',
    label: 'Stadium D',
    tag: 'VIP Premium',
    tagColor: '#8b5cf6',
    description: 'Premium VIP zone — upscale dining, private washrooms, and priority exits.',
    userPos: { x: 52, y: 60 },
    capacity: 15000,
    food_courts: [
      {
        id: 'D_fc_1',
        name: 'The Sky Lounge',
        type: 'food',
        cuisine: 'Fine Dining',
        priceRange: '$$$$',
        waitTime: 2,
        crowdLevel: 'Low',
        distance: '4 mins',
        rating: 4.9,
        x: 30,
        y: 20,
        accessible: true,
      },
      {
        id: 'D_fc_2',
        name: 'Executive Buffet',
        type: 'food',
        cuisine: 'International',
        priceRange: '$$$',
        waitTime: 5,
        crowdLevel: 'Low',
        distance: '3 mins',
        rating: 4.7,
        x: 70,
        y: 25,
        accessible: true,
      },
      {
        id: 'D_fc_3',
        name: 'Café Prestige',
        type: 'food',
        cuisine: 'Café & Snacks',
        priceRange: '$$',
        waitTime: 1,
        crowdLevel: 'Empty',
        distance: '2 mins',
        rating: 4.8,
        x: 55,
        y: 60,
        accessible: true,
      },
    ],
    washrooms: [
      {
        id: 'D_wr_1',
        name: 'VIP Suite WR',
        type: 'restroom',
        queue: 0,
        crowdLevel: 'Empty',
        distance: '1 min',
        accessible: true,
        x: 25,
        y: 70,
      },
      {
        id: 'D_wr_2',
        name: 'Premium Block WR',
        type: 'restroom',
        queue: 1,
        crowdLevel: 'Low',
        distance: '2 mins',
        accessible: true,
        x: 75,
        y: 70,
      },
    ],
    gates: [
      {
        id: 'D_g_1',
        name: 'VIP Priority Gate',
        type: 'exit',
        waitTime: 0,
        crowdLevel: 'Empty',
        distance: '2 mins',
        accessible: true,
        x: 15,
        y: 50,
      },
      {
        id: 'D_g_2',
        name: 'Premium Exit Alpha',
        type: 'exit',
        waitTime: 2,
        crowdLevel: 'Low',
        distance: '4 mins',
        accessible: true,
        x: 85,
        y: 50,
      },
    ],
  },
};

/**
 * Returns a deep clone of a stadium's dataset so mutations don't affect the source.
 * @param {string} stadiumId - Stadium identifier ('A' | 'B' | 'C' | 'D')
 * @returns {StadiumData} Deep-cloned stadium data object
 */
export const getStadiumSnapshot = (stadiumId) => {
  const stadium = STADIUMS[stadiumId];
  if (!stadium) return JSON.parse(JSON.stringify(STADIUMS['A']));
  return JSON.parse(JSON.stringify(stadium));
};

/**
 * Returns the best option from a list based on composite score.
 * Lower total friction (wait + crowd penalty) = better.
 *
 * @param {Array<object>} items - List of venue items
 * @param {'food'|'restroom'|'exit'} type - The type of venue item
 * @returns {object|null} - The best item, or null if list is empty
 */
export const getBestOption = (items, type) => {
  if (!items || items.length === 0) return null;

  const crowdScore = { Empty: 0, Low: 1, Medium: 2, High: 3 };

  return [...items].sort((a, b) => {
    const aScore =
      (type === 'restroom' ? a.queue : a.waitTime) +
      (crowdScore[a.crowdLevel] ?? 1) * 3;
    const bScore =
      (type === 'restroom' ? b.queue : b.waitTime) +
      (crowdScore[b.crowdLevel] ?? 1) * 3;
    return aScore - bScore;
  })[0];
};
