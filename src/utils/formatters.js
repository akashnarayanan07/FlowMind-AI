/**
 * formatters.js
 * Utility helpers for formatting data and Markdown rendering for the UI.
 */

/**
 * Converts Markdown bold text (**text**) and bullet lists into structured tokens.
 * Used by the chat renderer for accessible, well-formatted AI responses.
 * @param {string} text - Raw markdown string from AI
 * @returns {Array<{type: string, content: string}>} - Array of tokens
 */
export const parseMarkdown = (text) => {
  if (!text || typeof text !== 'string') return [];
  const tokens = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      tokens.push({ type: 'bullet', content: trimmed.slice(2) });
    } else if (trimmed === '') {
      tokens.push({ type: 'break', content: '' });
    } else {
      // Parse inline bold
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      tokens.push({ type: 'line', parts: parts.map(p =>
        p.startsWith('**') && p.endsWith('**')
          ? { bold: true, text: p.slice(2, -2) }
          : { bold: false, text: p }
      )});
    }
  }
  return tokens;
};

/**
 * Formats a crowd level string into a human-readable label with emoji.
 * @param {string} level - 'High' | 'Medium' | 'Low' | 'Empty'
 * @returns {string}
 */
export const formatCrowdLevel = (level) => {
  const map = {
    High: '🔴 High',
    Medium: '🟡 Medium',
    Low: '🟢 Low',
    Empty: '⚪ Empty',
  };
  return map[level] || level;
};

/**
 * Returns a trend indicator based on previous and current numeric values.
 * @param {number} prev - Previous value
 * @param {number} curr - Current value
 * @returns {{ arrow: string, direction: 'up'|'down'|'stable', delta: number }}
 */
export const getTrend = (prev, curr) => {
  const delta = curr - prev;
  if (delta > 0) return { arrow: '↑', direction: 'up', delta };
  if (delta < 0) return { arrow: '↓', direction: 'down', delta: Math.abs(delta) };
  return { arrow: '→', direction: 'stable', delta: 0 };
};

/**
 * Formats seconds into a human-readable "X min Y sec" string.
 * @param {number} seconds
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

/**
 * Generates a unique ID for list keys and accessibility IDs.
 * @param {string} prefix
 * @returns {string}
 */
export const generateId = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
