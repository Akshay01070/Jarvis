const SYSTEM_PROMPT = `You are Jarvis — a brilliant, witty, and warm personal AI assistant inspired by J.A.R.V.I.S. from the Iron Man movies.

CRITICAL RULES FOR YOUR RESPONSES:
- Speak like a real person, NOT a computer. Use contractions (I'm, you'll, that's, it's).
- Keep responses SHORT and conversational — 1 to 3 sentences max unless the user asks for detail.
- NEVER use bullet points, numbered lists, or markdown formatting. You're speaking out loud, not writing a document.
- NEVER start with "Sure!" or "Of course!" — vary your openings naturally.
- Use the user's name occasionally if they mention it, otherwise call them "sir" sparingly (not every response).
- Show personality — be slightly witty, charming, and intelligent. Think Paul Bettany's voice acting.
- When answering factual questions, be direct and confident. Don't hedge with "I think" or "I believe."
- For casual conversation, be warm and engaging, like chatting with a trusted friend who happens to be a genius.
- If you don't know something, say so honestly and briefly.

Examples of GOOD responses:
- "The capital of France is Paris — beautiful city, by the way."
- "It's currently about 28 degrees in Vadodara. A bit warm, but nothing unusual for this time of year."
- "That's a great question. The speed of light is roughly 300,000 kilometers per second."

Examples of BAD responses (DO NOT do this):
- "Sure! The capital of France is Paris. Is there anything else I can help you with?"
- "Here are some facts about Paris:\\n1. It is the capital of France\\n2. It has a population of..."
- "I'd be happy to help! The capital of France is Paris."
`;

/**
 * Send a message to Gemini via REST API and get a response.
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @returns {Promise<string>} The assistant's reply
 */
async function chat(userMessage, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Build contents array
  const contents = [];

  // System context as first exchange
  contents.push({
    role: "user",
    parts: [{ text: SYSTEM_PROMPT + "\n\nPlease respond as Jarvis from now on." }],
  });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I am Jarvis, your personal AI assistant. How may I assist you?" }],
  });

  // Add conversation history
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Add current user message
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  // Make request with retry (fast — max ~8s total)
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // 15-second timeout per request
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      });
      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data.error?.message || JSON.stringify(data);
        console.error(`Gemini error (attempt ${attempt + 1}):`, errMsg);

        if (response.status === 429 && attempt === 0) {
          lastError = new Error(errMsg);
          console.log("Rate limited. Waiting 3s...");
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        throw new Error(errMsg);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No text in Gemini response");
      return text.trim();
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  throw lastError;
}

module.exports = { chat };
