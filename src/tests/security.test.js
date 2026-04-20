import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitizeInput, checkRateLimit, isValidApiKey, truncateResponse } from '../utils/security';

describe('sanitizeInput', () => {
  it('removes HTML tags from input', () => {
    // <script>alert("xss")</script> → stripped tags leave 'alert(xss)Hello'
    const result = sanitizeInput('<script>alert("xss")</script>Hello');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).toContain('Hello');
  });

  it('strips injection characters', () => {
    // < and > are stripped; & is allowed since it is not in the injection chars list
    const result = sanitizeInput('Hello <world> & "test"');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('"');
    expect(result).toContain('Hello');
  });

  it('collapses multiple spaces', () => {
    expect(sanitizeInput('hello    world')).toBe('hello world');
  });

  it('truncates input to 500 characters', () => {
    const longInput = 'a'.repeat(600);
    expect(sanitizeInput(longInput).length).toBe(500);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

describe('isValidApiKey', () => {
  it('returns true for a well-formed key', () => {
    expect(isValidApiKey('AIzaSyAbcdef12345678901234567890')).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(isValidApiKey('')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidApiKey(null)).toBe(false);
  });

  it('returns false for keys shorter than 20 chars', () => {
    expect(isValidApiKey('short')).toBe(false);
  });

  it('returns false for keys with special characters', () => {
    expect(isValidApiKey('bad key! with spaces')).toBe(false);
  });
});

describe('truncateResponse', () => {
  it('returns text unchanged if under maxLength', () => {
    expect(truncateResponse('Hello world', 100)).toBe('Hello world');
  });

  it('truncates and appends ellipsis if over maxLength', () => {
    const result = truncateResponse('a'.repeat(100), 50);
    expect(result.length).toBe(51); // 50 chars + ellipsis char
    expect(result.endsWith('…')).toBe(true);
  });

  it('returns empty string for null or undefined input', () => {
    expect(truncateResponse(null)).toBe('');
    expect(truncateResponse(undefined)).toBe('');
  });
});
