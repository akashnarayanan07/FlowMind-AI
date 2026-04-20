/**
 * dataService.js
 * Real-time venue data simulation layer for FlowMind AI.
 *
 * Architecture:
 *  - Observer pattern mirrors Firebase Realtime Database subscriptions.
 *  - Separate simulation intervals model different update cadences:
 *    * Fast (3s): food court waits and gate congestion fluctuations
 *    * Slow (60s): washroom queue gradual draining with spike events
 *  - Alert system fires callbacks when wait times spike above threshold.
 *
 * In a production deployment, this module would be replaced by
 * Firebase Realtime Database listeners using onValue() from firebase/database.
 */

import { STADIUMS } from './stadiumData';

// ─── Alert System ─────────────────────────────────────────────────────────────

/** Threshold percentage above which an alert fires. */
const ALERT_SPIKE_THRESHOLD = 0.5; // 50% increase

/** @type {Array<function>} Global alert listeners */
let alertListeners = [];

/**
 * Subscribe to venue alert events (e.g. sudden congestion spikes).
 * @param {function({type: string, stadium: string, item: object, message: string}): void} callback
 * @returns {function} Unsubscribe function
 */
export const subscribeToAlerts = (callback) => {
  alertListeners.push(callback);
  return () => {
    alertListeners = alertListeners.filter(l => l !== callback);
  };
};

/**
 * Internal: fire an alert to all listeners.
 * @param {object} alertPayload
 */
const fireAlert = (alertPayload) => {
  alertListeners.forEach(l => l(alertPayload));
};

// ─── Legacy Flat Data (backward-compatible) ──────────────────────────────────

/**
 * Static venue data used by the legacy getDecisionGuidance path.
 * Stadium-specific data is stored in stadiumLiveData below.
 * @type {object}
 */
const venuesData = {
  food_courts: [
    { id: 'fc_a', name: 'Food Court A', type: 'food', waitTime: 15, crowdLevel: 'High', distance: '2 mins', rating: 4.2 },
    { id: 'fc_b', name: 'Food Court B', type: 'food', waitTime: 8, crowdLevel: 'Medium', distance: '5 mins', rating: 3.8 },
    { id: 'fc_c', name: 'Burger & Co (North Wing)', type: 'food', waitTime: 3, crowdLevel: 'Low', distance: '6 mins', rating: 4.5 },
  ],
  washrooms: [
    { id: 'wr_1', name: 'East Washroom', type: 'restroom', queue: 12, crowdLevel: 'High', distance: '1 min' },
    { id: 'wr_2', name: 'West Washroom', type: 'restroom', queue: 2, crowdLevel: 'Low', distance: '4 mins' },
    { id: 'wr_3', name: 'Upper Level Washroom', type: 'restroom', queue: 0, crowdLevel: 'Empty', distance: '3 mins' },
  ],
  gates: [
    { id: 'gate_1', name: 'Main Gate', type: 'exit', waitTime: 25, crowdLevel: 'High', distance: '5 mins' },
    { id: 'gate_2', name: 'North Exit', type: 'exit', waitTime: 5, crowdLevel: 'Low', distance: '8 mins' },
  ],
};

/** @type {Array<function>} Legacy flat-data observers */
let observers = [];

/**
 * Subscribe to flat venue data changes (legacy support).
 * @param {function(object): void} callback
 * @returns {function} Unsubscribe function
 */
export const subscribeToVenueData = (callback) => {
  observers.push(callback);
  callback({ ...venuesData });
  return () => {
    observers = observers.filter(obs => obs !== callback);
  };
};

/** Notify all flat-data observers. */
const notifyObservers = () => {
  observers.forEach(callback => callback({ ...venuesData }));
};

// Legacy random update interval — flat data only
setInterval(() => {
  let changed = false;

  if (Math.random() > 0.6) {
    const fc = venuesData.food_courts[Math.floor(Math.random() * venuesData.food_courts.length)];
    fc.waitTime = Math.max(0, fc.waitTime + (Math.floor(Math.random() * 5) - 2));
    fc.crowdLevel = fc.waitTime > 12 ? 'High' : fc.waitTime > 5 ? 'Medium' : 'Low';
    changed = true;
  }

  if (Math.random() > 0.6) {
    const wr = venuesData.washrooms[Math.floor(Math.random() * venuesData.washrooms.length)];
    wr.queue = Math.max(0, wr.queue + (Math.floor(Math.random() * 3) - 1));
    wr.crowdLevel = wr.queue > 8 ? 'High' : wr.queue > 3 ? 'Medium' : 'Low';
    changed = true;
  }

  if (Math.random() > 0.8) {
    const gate = venuesData.gates[Math.floor(Math.random() * venuesData.gates.length)];
    gate.waitTime = Math.max(0, gate.waitTime + (Math.floor(Math.random() * 7) - 3));
    gate.crowdLevel = gate.waitTime > 15 ? 'High' : gate.waitTime > 5 ? 'Medium' : 'Low';
    changed = true;
  }

  if (changed) notifyObservers();
}, 3000);

/**
 * Get current venue snapshot for AI context (legacy).
 * @returns {object}
 */
export const getCurrentVenueContext = () => JSON.parse(JSON.stringify(venuesData));

// ─── Per-Stadium Live Data ───────────────────────────────────────────────────

/**
 * Live mutable copies of each stadium's data.
 * Mutations simulate what Firebase Realtime DB listeners would provide.
 * @type {Record<string, object>}
 */
const stadiumLiveData = {
  A: JSON.parse(JSON.stringify(STADIUMS['A'])),
  B: JSON.parse(JSON.stringify(STADIUMS['B'])),
  C: JSON.parse(JSON.stringify(STADIUMS['C'])),
  D: JSON.parse(JSON.stringify(STADIUMS['D'])),
};

/** @type {Array<{stadiumId: string, callback: function}>} */
let stadiumObservers = [];

/**
 * Subscribe to live data updates for a specific stadium.
 * Mirrors Firebase's onValue(ref, callback) subscription pattern.
 *
 * @param {string} stadiumId - Stadium ID to subscribe to
 * @param {function(object): void} callback - Called on each data change
 * @returns {function} Unsubscribe / cleanup function
 */
export const subscribeToStadiumData = (stadiumId, callback) => {
  const entry = { stadiumId, callback };
  stadiumObservers.push(entry);
  // Immediately push current state (mirrors Firebase's immediate first callback)
  callback(JSON.parse(JSON.stringify(stadiumLiveData[stadiumId] || stadiumLiveData['A'])));
  return () => {
    stadiumObservers = stadiumObservers.filter(o => o !== entry);
  };
};

/**
 * Notify all observers subscribed to a given stadium.
 * @param {string} changedId - Stadium ID whose data changed
 */
const notifyStadiumObservers = (changedId) => {
  stadiumObservers
    .filter(o => o.stadiumId === changedId)
    .forEach(o => o.callback(JSON.parse(JSON.stringify(stadiumLiveData[changedId]))));
};

/**
 * Get current stadium snapshot for AI context injection.
 * @param {string} stadiumId - Stadium ID
 * @returns {object} - Deep-cloned snapshot of current live data
 */
export const getCurrentStadiumContext = (stadiumId) =>
  JSON.parse(JSON.stringify(stadiumLiveData[stadiumId] || stadiumLiveData['A']));

// ─── Simulation: Washroom Queue Drain + Spike (every 60s) ───────────────────

/**
 * Simulates gradual washroom queue drain (people leaving) with random spikes
 * representing sudden crowds (e.g., half-time rush).
 * Runs every 60 seconds across all stadiums.
 */
setInterval(() => {
  Object.keys(stadiumLiveData).forEach(sid => {
    const sd = stadiumLiveData[sid];
    let changed = false;

    sd.washrooms.forEach(wr => {
      const prevQueue = wr.queue;
      const fluctuation = Math.random();

      if (fluctuation < 0.12) {
        // 12% chance: half-time spike
        wr.queue = Math.min(wr.queue + Math.floor(Math.random() * 4) + 2, 25);
        // Fire alert if spike is significant
        const spikePct = prevQueue > 0
          ? (wr.queue - prevQueue) / prevQueue
          : 1;
        if (spikePct >= ALERT_SPIKE_THRESHOLD) {
          fireAlert({
            type: 'washroom_spike',
            stadium: sid,
            item: wr,
            message: `🚨 ${wr.name} (Stadium ${sid}) queue jumped to ${wr.queue}!`,
          });
        }
      } else {
        // Gradual drain
        wr.queue = Math.max(0, wr.queue - 1);
      }

      wr.crowdLevel =
        wr.queue > 10 ? 'High' :
        wr.queue > 4  ? 'Medium' :
        wr.queue > 0  ? 'Low'    : 'Empty';

      changed = true;
    });

    // Occasionally update food court waits (slow drift)
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
}, 60000);

// ─── Simulation: Fast Fluctuation — Food & Gates (every 3s) ─────────────────

/**
 * Rapid fluctuation for food courts and gate waits.
 * Simulates dynamic crowd movement during events.
 * Runs every 3 seconds across all stadiums.
 */
setInterval(() => {
  Object.keys(stadiumLiveData).forEach(sid => {
    const sd = stadiumLiveData[sid];
    let changed = false;

    // Food court fluctuation
    if (Math.random() > 0.65) {
      const fc = sd.food_courts[Math.floor(Math.random() * sd.food_courts.length)];
      const prevWait = fc.waitTime;
      fc.waitTime = Math.max(0, fc.waitTime + (Math.floor(Math.random() * 5) - 2));
      fc.crowdLevel = fc.waitTime > 12 ? 'High' : fc.waitTime > 5 ? 'Medium' : 'Low';

      // Alert on sudden spike
      if (prevWait > 0 && (fc.waitTime - prevWait) / prevWait >= ALERT_SPIKE_THRESHOLD) {
        fireAlert({
          type: 'food_spike',
          stadium: sid,
          item: fc,
          message: `🍴 ${fc.name} (Stadium ${sid}) wait up to ${fc.waitTime}m!`,
        });
      }
      changed = true;
    }

    // Washroom minor fluctuation
    if (Math.random() > 0.72) {
      const wr = sd.washrooms[Math.floor(Math.random() * sd.washrooms.length)];
      wr.queue = Math.max(0, wr.queue + (Math.floor(Math.random() * 3) - 1));
      wr.crowdLevel =
        wr.queue > 8 ? 'High' :
        wr.queue > 3 ? 'Medium' :
        wr.queue > 0 ? 'Low'   : 'Empty';
      changed = true;
    }

    // Gate fluctuation
    if (Math.random() > 0.75 && sd.gates?.length) {
      const gate = sd.gates[Math.floor(Math.random() * sd.gates.length)];
      gate.waitTime = Math.max(0, gate.waitTime + (Math.floor(Math.random() * 7) - 3));
      gate.crowdLevel = gate.waitTime > 15 ? 'High' : gate.waitTime > 5 ? 'Medium' : 'Low';
      changed = true;
    }

    if (changed) notifyStadiumObservers(sid);
  });
}, 3000);
