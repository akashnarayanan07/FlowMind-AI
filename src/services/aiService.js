import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
let genAI = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * MOCK AI RESPONSE GENERATOR
 * Used when no real Gemini API key is provided. It analyzes the context
 * manually to simulate a smart, decision-making LLM.
 */
const generateMockResponse = async (prompt, context) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      let response = "I'm not sure how to help with that. Could you ask about food, washrooms, or gates?";

      if (lowerPrompt.includes('eat') || lowerPrompt.includes('food') || lowerPrompt.includes('hungry')) {
        const fc = context.food_courts;
        // Sort by wait time
        const sorted = [...fc].sort((a, b) => a.waitTime - b.waitTime);
        const best = sorted[0];
        const alt = sorted[1];
        
        response = `${alt.name} is closer (${alt.distance}) but moderately crowded with an ${alt.waitTime} min wait.
${best.name} is slightly farther (${best.distance}) but has only a ${best.waitTime} min wait.
**Recommended: ${best.name}.**`;
      } 
      else if (lowerPrompt.includes('washroom') || lowerPrompt.includes('toilet') || lowerPrompt.includes('restroom') || lowerPrompt.includes('pee')) {
        const wr = context.washrooms;
        const sorted = [...wr].sort((a, b) => a.queue - b.queue);
        const best = sorted[0];
        const closest = wr.find(w => w.id === 'wr_1'); // Fake closest

        if (closest.id === best.id) {
           response = `The ${best.name} is the closest (${best.distance}) and currently has almost no queue (${best.queue} people). **Recommended: ${best.name}.**`;
        } else {
           response = `The ${closest.name} is closer (${closest.distance}) but has a long queue of ${closest.queue} people. 
The ${best.name} is ${best.distance} away but has a queue of only ${best.queue} people.
**Recommended: ${best.name}** for the fastest experience.`;
        }
      }
      else if (lowerPrompt.includes('gate') || lowerPrompt.includes('exit') || lowerPrompt.includes('leave')) {
        const gates = context.gates;
        const sorted = [...gates].sort((a, b) => a.waitTime - b.waitTime);
        const best = sorted[0];
        const worse = sorted[1];

        response = `The ${worse.name} is currently highly congested with a ${worse.waitTime} min wait. 
The ${best.name} is a bit farther (${best.distance}) but the wait is only ${best.waitTime} mins.
**Recommended: Head to the ${best.name}.**`;
      }
      resolve(response);
    }, 1500); // 1.5s simulated thinking time
  });
};


/**
 * Core AI routing function
 */
export const getDecisionGuidance = async (userPrompt, currentContext) => {
  const systemInstruction = `
You are FlowMind AI, a real-time decision-making guide for event venue attendees.
You receive the user's prompt and a JSON object containing current real-time venue data (wait times, queues, distances).

Rules:
1. Always compare at least 2 relevant options based on the user's request (e.g., if they ask for food, pick 2 food courts).
2. Recommend the BEST option holistically, not just the nearest one. Consider wait times heavily.
3. Include clear reasoning in your response.
4. Keep the response short, conversational, human-like, and highly actionable.
5. Use markdown for emphasis (e.g., **Recommended: ...**).

Current Venue Data:
${JSON.stringify(currentContext, null, 2)}
  `;

  if (!genAI) {
    console.warn("No VITE_GEMINI_API_KEY found, using realistic mock simulator.");
    return await generateMockResponse(userPrompt, currentContext);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, my systems are currently encountering interference. Please try again or use the manual venue displays.";
  }
};

// ─── ENHANCED CONTEXT-AWARE AI ────────────────────────────────────────────────────

/**
 * Context-aware mock that uses stadium + category to give smarter responses.
 */
const generateContextMockResponse = async (prompt, context, stadium, category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      const stadiumLabel = `Stadium ${stadium}`;

      // Determine effective category from prompt if not explicitly set
      const isFood = category === 'food' || lowerPrompt.includes('eat') || lowerPrompt.includes('food') || lowerPrompt.includes('hungry');
      const isWash = category === 'washrooms' || lowerPrompt.includes('washroom') || lowerPrompt.includes('toilet') || lowerPrompt.includes('restroom');
      const isExit = category === 'exits' || lowerPrompt.includes('exit') || lowerPrompt.includes('leave') || lowerPrompt.includes('gate');

      let response;

      if (isFood) {
        const fc = context.food_courts || [];
        if (!fc.length) { resolve(`There are no food options currently tracked in ${stadiumLabel}.`); return; }
        const sorted = [...fc].sort((a, b) => a.waitTime - b.waitTime);
        const best = sorted[0];
        const alt = sorted[1];
        response = alt
          ? `In **${stadiumLabel}**, **${best.name}** has the shortest wait right now (${best.waitTime} min, ${best.crowdLevel} crowd, ${best.distance} away)${alt ? ` vs ${alt.name} at ${alt.waitTime} min` : ''}. **Recommended: ${best.name}.**`
          : `In **${stadiumLabel}**, your best food option is **${best.name}** — ${best.waitTime} min wait. Head there now!`;
      } else if (isWash) {
        const wr = context.washrooms || [];
        if (!wr.length) { resolve(`No washroom data for ${stadiumLabel}.`); return; }
        const sorted = [...wr].sort((a, b) => a.queue - b.queue);
        const best = sorted[0];
        const alt = sorted[1];
        response = alt
          ? `In **${stadiumLabel}**, **${best.name}** has the shortest queue (${best.queue} people, ${best.distance})${alt ? ` vs ${alt.name} with ${alt.queue} people` : ''}. **Recommended: ${best.name}.**`
          : `Go to **${best.name}** in ${stadiumLabel} — only ${best.queue} people waiting!`;
      } else if (isExit) {
        const gates = context.gates || [];
        if (!gates.length) { resolve(`No exit data for ${stadiumLabel}.`); return; }
        const sorted = [...gates].sort((a, b) => a.waitTime - b.waitTime);
        const best = sorted[0];
        const alt = sorted[1];
        response = alt
          ? `In **${stadiumLabel}**, the **${best.name}** is least crowded (${best.waitTime} min wait, ${best.distance})${alt ? ` vs ${alt.name} at ${alt.waitTime} min` : ''}. **Recommended: ${best.name}.**`
          : `Use **${best.name}** in ${stadiumLabel} for the fastest exit — only ${best.waitTime} min wait!`;
      } else {
        // General guidance
        const bestFood = (context.food_courts || []).sort((a, b) => a.waitTime - b.waitTime)[0];
        const bestWash = (context.washrooms || []).sort((a, b) => a.queue - b.queue)[0];
        const bestExit = (context.gates || []).sort((a, b) => a.waitTime - b.waitTime)[0];
        response = `You're currently at **${stadiumLabel}**. Here's a quick overview:\n`;
        if (bestFood) response += `• **Food**: ${bestFood.name} (${bestFood.waitTime}m wait)\n`;
        if (bestWash) response += `• **Washroom**: ${bestWash.name} (${bestWash.queue} in queue)\n`;
        if (bestExit) response += `• **Exit**: ${bestExit.name} (${bestExit.waitTime}m wait)\n`;
        response += `\nTap a category tab on the map for detailed navigation!`;
      }

      resolve(response);
    }, 1200);
  });
};

/**
 * Enhanced routing function — stadium and category aware.
 * Does NOT replace getDecisionGuidance; existing code still works.
 */
export const getContextAwareGuidance = async (userPrompt, currentContext, stadium, category) => {
  const stadiumLabel = `Stadium ${stadium}`;

  const systemInstruction = `
You are FlowMind AI, a real-time decision guide for event venue attendees.
The user is at **${stadiumLabel}**.
${category ? `The user has selected the category: **${category.toUpperCase()}**.` : 'No specific category selected.'}

Rules:
1. Reference the stadium by name (${stadiumLabel}).
2. Focus your answer on the selected category if set.
3. Compare options using the live data below before recommending.
4. Keep responses short, human, and actionable.
5. Use markdown bold for emphasis.

Current Live Data for ${stadiumLabel}:
${JSON.stringify(currentContext, null, 2)}
  `;

  if (!genAI) {
    console.warn("No VITE_GEMINI_API_KEY found, using context-aware mock.");
    return await generateContextMockResponse(userPrompt, currentContext, stadium, category);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
    const result = await model.generateContent(userPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble processing that. Please try again!";
  }
};

