import { describe, it, expect } from 'vitest';
import { STADIUMS, getStadiumSnapshot, getBestOption } from '../services/stadiumData';

describe('STADIUMS data integrity', () => {
  const stadiumIds = ['A', 'B', 'C', 'D'];

  stadiumIds.forEach(id => {
    describe(`Stadium ${id}`, () => {
      it('has required top-level fields', () => {
        const s = STADIUMS[id];
        expect(s).toBeDefined();
        expect(s.id).toBe(id);
        expect(s.label).toBeTruthy();
        expect(s.tag).toBeTruthy();
        expect(s.tagColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(s.userPos).toHaveProperty('x');
        expect(s.userPos).toHaveProperty('y');
      });

      it('has at least one food court', () => {
        expect(STADIUMS[id].food_courts.length).toBeGreaterThan(0);
      });

      it('has at least one washroom', () => {
        expect(STADIUMS[id].washrooms.length).toBeGreaterThan(0);
      });

      it('has at least one gate/exit', () => {
        expect(STADIUMS[id].gates.length).toBeGreaterThan(0);
      });

      it('all food courts have required fields', () => {
        STADIUMS[id].food_courts.forEach(fc => {
          expect(fc.id).toBeTruthy();
          expect(fc.name).toBeTruthy();
          expect(typeof fc.waitTime).toBe('number');
          expect(fc.waitTime).toBeGreaterThanOrEqual(0);
          expect(['High', 'Medium', 'Low', 'Empty']).toContain(fc.crowdLevel);
          expect(typeof fc.x).toBe('number');
          expect(typeof fc.y).toBe('number');
        });
      });

      it('all washrooms have required fields', () => {
        STADIUMS[id].washrooms.forEach(wr => {
          expect(wr.id).toBeTruthy();
          expect(wr.name).toBeTruthy();
          expect(typeof wr.queue).toBe('number');
          expect(wr.queue).toBeGreaterThanOrEqual(0);
          expect(['High', 'Medium', 'Low', 'Empty']).toContain(wr.crowdLevel);
        });
      });

      it('all gates have required fields', () => {
        STADIUMS[id].gates.forEach(gate => {
          expect(gate.id).toBeTruthy();
          expect(gate.name).toBeTruthy();
          expect(typeof gate.waitTime).toBe('number');
          expect(gate.waitTime).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});

describe('getStadiumSnapshot', () => {
  it('returns a deep clone — mutation does not affect source', () => {
    const snapshot = getStadiumSnapshot('A');
    snapshot.food_courts[0].waitTime = 9999;
    expect(STADIUMS['A'].food_courts[0].waitTime).not.toBe(9999);
  });

  it('falls back to Stadium A for unknown IDs', () => {
    const snapshot = getStadiumSnapshot('Z');
    expect(snapshot.id).toBe('A');
  });
});

describe('getBestOption', () => {
  const foodList = [
    { id: 'f1', name: 'A', waitTime: 15, crowdLevel: 'High' },
    { id: 'f2', name: 'B', waitTime: 3,  crowdLevel: 'Low'  },
    { id: 'f3', name: 'C', waitTime: 8,  crowdLevel: 'Medium' },
  ];

  it('returns the item with the lowest composite score for food', () => {
    const best = getBestOption(foodList, 'food');
    expect(best.id).toBe('f2'); // lowest waitTime + lowest crowd
  });

  const washroomList = [
    { id: 'w1', name: 'X', queue: 12, crowdLevel: 'High' },
    { id: 'w2', name: 'Y', queue: 0,  crowdLevel: 'Empty' },
    { id: 'w3', name: 'Z', queue: 5,  crowdLevel: 'Medium' },
  ];

  it('returns the item with the lowest queue for restrooms', () => {
    const best = getBestOption(washroomList, 'restroom');
    expect(best.id).toBe('w2');
  });

  it('returns null for an empty list', () => {
    expect(getBestOption([], 'food')).toBeNull();
  });

  it('returns null when input is null', () => {
    expect(getBestOption(null, 'food')).toBeNull();
  });

  it('does not mutate the original list', () => {
    const original = [...foodList];
    getBestOption(foodList, 'food');
    expect(foodList).toEqual(original);
  });
});
