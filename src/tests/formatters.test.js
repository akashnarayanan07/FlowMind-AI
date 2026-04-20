import { describe, it, expect } from 'vitest';
import { parseMarkdown, formatCrowdLevel, getTrend, formatDuration, generateId } from '../utils/formatters';

describe('parseMarkdown', () => {
  it('returns empty array for empty or null input', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown(null)).toEqual([]);
  });

  it('parses a plain line into a line token', () => {
    const result = parseMarkdown('Hello world');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('line');
  });

  it('parses a bullet line starting with "- "', () => {
    const result = parseMarkdown('- First item');
    expect(result[0].type).toBe('bullet');
    expect(result[0].content).toBe('First item');
  });

  it('parses a bullet line starting with "• "', () => {
    const result = parseMarkdown('• Second item');
    expect(result[0].type).toBe('bullet');
    expect(result[0].content).toBe('Second item');
  });

  it('inserts a break token for empty lines', () => {
    const result = parseMarkdown('Line one\n\nLine two');
    const breakToken = result.find(t => t.type === 'break');
    expect(breakToken).toBeDefined();
  });

  it('correctly marks bold parts within a line', () => {
    const result = parseMarkdown('Go to **North Exit** now');
    const lineParts = result[0].parts;
    const boldPart = lineParts.find(p => p.bold);
    expect(boldPart?.text).toBe('North Exit');
  });
});

describe('formatCrowdLevel', () => {
  it('formats High with red emoji', () => {
    expect(formatCrowdLevel('High')).toBe('🔴 High');
  });

  it('formats Medium with yellow emoji', () => {
    expect(formatCrowdLevel('Medium')).toBe('🟡 Medium');
  });

  it('formats Low with green emoji', () => {
    expect(formatCrowdLevel('Low')).toBe('🟢 Low');
  });

  it('formats Empty with white circle', () => {
    expect(formatCrowdLevel('Empty')).toBe('⚪ Empty');
  });

  it('returns the original string for unknown levels', () => {
    expect(formatCrowdLevel('Unknown')).toBe('Unknown');
  });
});

describe('getTrend', () => {
  it('returns up arrow when value increased', () => {
    const result = getTrend(5, 8);
    expect(result.direction).toBe('up');
    expect(result.arrow).toBe('↑');
    expect(result.delta).toBe(3);
  });

  it('returns down arrow when value decreased', () => {
    const result = getTrend(10, 6);
    expect(result.direction).toBe('down');
    expect(result.arrow).toBe('↓');
    expect(result.delta).toBe(4);
  });

  it('returns stable arrow when value unchanged', () => {
    const result = getTrend(5, 5);
    expect(result.direction).toBe('stable');
    expect(result.arrow).toBe('→');
    expect(result.delta).toBe(0);
  });
});

describe('formatDuration', () => {
  it('returns seconds for under 60s', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('returns minutes for exactly 60s', () => {
    expect(formatDuration(60)).toBe('1m');
  });

  it('returns minutes and seconds for values above 60', () => {
    expect(formatDuration(90)).toBe('1m 30s');
  });

  it('returns only minutes when seconds are 0', () => {
    expect(formatDuration(120)).toBe('2m');
  });
});

describe('generateId', () => {
  it('returns a string starting with the given prefix', () => {
    const id = generateId('test');
    expect(id.startsWith('test-')).toBe(true);
  });

  it('returns unique IDs each call', () => {
    const id1 = generateId('btn');
    const id2 = generateId('btn');
    expect(id1).not.toBe(id2);
  });
});
