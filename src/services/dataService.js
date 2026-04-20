// Simulated Firebase Realtime Database for FlowMind AI
import { STADIUMS } from './stadiumData';

// Initial static data
const venuesData = {
  food_courts: [
    { id: 'fc_a', name: 'Food Court A', type: 'food', waitTime: 15, crowdLevel: 'High', distance: '2 mins', rating: 4.2 },
    { id: 'fc_b', name: 'Food Court B', type: 'food', waitTime: 8, crowdLevel: 'Medium', distance: '5 mins', rating: 3.8 },
    { id: 'fc_c', name: 'Burger & Co (North Wing)', type: 'food', waitTime: 3, crowdLevel: 'Low', distance: '6 mins', rating: 4.5 }
  ],
  washrooms: [
    { id: 'wr_1', name: 'East Washroom', type: 'restroom', queue: 12, crowdLevel: 'High', distance: '1 min' },
    { id: 'wr_2', name: 'West Washroom', type: 'restroom', queue: 2, crowdLevel: 'Low', distance: '4 mins' },
    { id: 'wr_3', name: 'Upper Level Washroom', type: 'restroom', queue: 0, crowdLevel: 'Empty', distance: '3 mins' }
  ],
  gates: [
    { id: 'gate_1', name: 'Main Gate', type: 'exit', waitTime: 25, crowdLevel: 'High', distance: '5 mins' },
    { id: 'gate_2', name: 'North Exit', type: 'exit', waitTime: 5, crowdLevel: 'Low', distance: '8 mins' }
  ]
};

// Observers for React components to subscribe to "live" updates
let observers = [];

export const subscribeToVenueData = (callback) => {
  observers.push(callback);
  callback(venuesData); // Initial push
  
  // Return unsubscribe
  return () => {
    observers = observers.filter(obs => obs !== callback);
  };
};

const notifyObservers = () => {
  observers.forEach(callback => callback({...venuesData}));
};

// Simulate Real-time Changes (Like Firebase)
setInterval(() => {
  let changed = false;
  
  // Randomly update a food court wait time
  if (Math.random() > 0.6) {
    const fc = venuesData.food_courts[Math.floor(Math.random() * venuesData.food_courts.length)];
    fc.waitTime = Math.max(0, fc.waitTime + (Math.floor(Math.random() * 5) - 2));
    fc.crowdLevel = fc.waitTime > 12 ? 'High' : (fc.waitTime > 5 ? 'Medium' : 'Low');
    changed = true;
  }
  
  // Randomly update a washroom queue
  if (Math.random() > 0.6) {
    const wr = venuesData.washrooms[Math.floor(Math.random() * venuesData.washrooms.length)];
    wr.queue = Math.max(0, wr.queue + (Math.floor(Math.random() * 3) - 1));
    wr.crowdLevel = wr.queue > 8 ? 'High' : (wr.queue > 3 ? 'Medium' : 'Low');
    changed = true;
  }

  // Randomly update a gate wait time
  if (Math.random() > 0.8) {
    const gate = venuesData.gates[Math.floor(Math.random() * venuesData.gates.length)];
    gate.waitTime = Math.max(0, gate.waitTime + (Math.floor(Math.random() * 7) - 3));
    gate.crowdLevel = gate.waitTime > 15 ? 'High' : (gate.waitTime > 5 ? 'Medium' : 'Low');
    changed = true;
  }

  if (changed) {
    notifyObservers();
  }
}, 3000); // Check for updates every 3 seconds

// Get current snapshot for AI context
export const getCurrentVenueContext = () => {
  return JSON.parse(JSON.stringify(venuesData));
};

// ─── STADIUM-AWARE SUBSCRIPTIONS ────────────────────────────────────────────

// Live copies of each stadium's data (mutated by simulation)
const stadiumLiveData = {
  A: JSON.parse(JSON.stringify(STADIUMS['A'])),
  B: JSON.parse(JSON.stringify(STADIUMS['B'])),
  C: JSON.parse(JSON.stringify(STADIUMS['C'])),
};

let stadiumObservers = []; // { stadiumId, callback }

export const subscribeToStadiumData = (stadiumId, callback) => {
  const entry = { stadiumId, callback };
  stadiumObservers.push(entry);
  callback(JSON.parse(JSON.stringify(stadiumLiveData[stadiumId])));
  return () => {
    stadiumObservers = stadiumObservers.filter(o => o !== entry);
  };
};

const notifyStadiumObservers = (changedId) => {
  stadiumObservers
    .filter(o => o.stadiumId === changedId)
    .forEach(o => o.callback(JSON.parse(JSON.stringify(stadiumLiveData[changedId]))));
};

// Get current stadium snapshot for AI
export const getCurrentStadiumContext = (stadiumId) => {
  return JSON.parse(JSON.stringify(stadiumLiveData[stadiumId] || stadiumLiveData['A']));
};

// ─── FAST QUEUE SIMULATION (60s decrement with fluctuation) ─────────────────
setInterval(() => {
  Object.keys(stadiumLiveData).forEach(sid => {
    const sd = stadiumLiveData[sid];
    let changed = false;

    // Decrement washroom queues — occasionally bump up for realism
    sd.washrooms.forEach(wr => {
      const fluctuation = Math.random();
      if (fluctuation < 0.15) {
        // 15% chance of a spike (+2 to +4)
        wr.queue = Math.min(wr.queue + Math.floor(Math.random() * 3) + 2, 20);
      } else {
        // Otherwise decrease by 1
        wr.queue = Math.max(0, wr.queue - 1);
      }
      wr.crowdLevel = wr.queue > 10 ? 'High' : wr.queue > 4 ? 'Medium' : wr.queue > 0 ? 'Low' : 'Empty';
      changed = true;
    });

    // Occasionally update food court waits
    if (Math.random() > 0.5) {
      sd.food_courts.forEach(fc => {
        const delta = Math.floor(Math.random() * 5) - 2;
        fc.waitTime = Math.max(0, fc.waitTime + delta);
        fc.crowdLevel = fc.waitTime > 12 ? 'High' : fc.waitTime > 5 ? 'Medium' : 'Low';
      });
      changed = true;
    }

    if (changed) notifyStadiumObservers(sid);
  });
}, 60000); // Every 60 seconds

// Also rapid fluctuation for food/gate (3s) on stadium data
setInterval(() => {
  Object.keys(stadiumLiveData).forEach(sid => {
    const sd = stadiumLiveData[sid];
    let changed = false;

    if (Math.random() > 0.65) {
      const fc = sd.food_courts[Math.floor(Math.random() * sd.food_courts.length)];
      fc.waitTime = Math.max(0, fc.waitTime + (Math.floor(Math.random() * 5) - 2));
      fc.crowdLevel = fc.waitTime > 12 ? 'High' : fc.waitTime > 5 ? 'Medium' : 'Low';
      changed = true;
    }
    if (Math.random() > 0.7) {
      const wr = sd.washrooms[Math.floor(Math.random() * sd.washrooms.length)];
      wr.queue = Math.max(0, wr.queue + (Math.floor(Math.random() * 3) - 1));
      wr.crowdLevel = wr.queue > 8 ? 'High' : wr.queue > 3 ? 'Medium' : wr.queue > 0 ? 'Low' : 'Empty';
      changed = true;
    }
    if (changed) notifyStadiumObservers(sid);
  });
}, 3000);
