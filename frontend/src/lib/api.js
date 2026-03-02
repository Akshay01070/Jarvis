const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Send a message to the JARVIS backend and get a response.
 * @param {string} message
 * @param {Array} history
 * @returns {Promise<{reply: string, weatherData: Object|null}>}
 */
export async function sendMessage(message, history = []) {
    const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
    }

    return res.json();
}

/**
 * Fetch current weather data for a city.
 * @param {string} city
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeather(city = "Vadodara") {
    const res = await fetch(`${API_BASE}/api/chat/weather?city=${encodeURIComponent(city)}`);

    if (!res.ok) {
        throw new Error(`Weather API error: ${res.status}`);
    }

    return res.json();
}
