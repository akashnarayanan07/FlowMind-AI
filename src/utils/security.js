/**
 * security.js
 * Utility functions for safe input handling and rate limiting.
 * Ensures responsible use of AI APIs and prevents misuse.
 */

// Rate limiter: maximum AI queries per minute per session
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const queryTimestamps = [];

/**
 * Checks if a new AI query is allowed under the rate limit.
 * @returns {{ allowed: boolean, waitMs: number }} - whether query is permitted
 */
export const checkRateLimit = () => {
  const now = Date.now();
  // Remove timestamps older than the window
  while (queryTimestamps.length > 0 && queryTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    queryTimestamps.shift();
  }
  if (queryTimestamps.length >= RATE_LIMIT_MAX) {
    const waitMs = RATE_LIMIT_WINDOW_MS - (now - queryTimestamps[0]);
    return { allowed: false, waitMs };
  }
  queryTimestamps.push(now);
  return { allowed: true, waitMs: 0 };
};

/**
 * Sanitizes user input before sending to the AI model.
 * Strips HTML tags, limits length, and removes potential injection patterns.
 * @param {string} input - Raw user input string
 * @returns {string} - Sanitized, safe input string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[<>"'`]/g, '')           // Remove characters used in injection
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .trim()
    .slice(0, 500);                    // Hard cap at 500 characters
};

/**
 * Validates that an API key string has expected format.
 * Does NOT expose or log the key itself.
 * @param {string} key - The API key to validate
 * @returns {boolean} - true if key looks well-formed
 */
export const isValidApiKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  return key.length > 20 && /^[A-Za-z0-9_\-]+$/.test(key);
};

/**
 * Safely truncates AI response for display, preventing excessively long renders.
 * @param {string} text - Raw AI text
 * @param {number} maxLength - Max characters to display
 * @returns {string}
 */
export const truncateResponse = (text, maxLength = 2000) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
};
