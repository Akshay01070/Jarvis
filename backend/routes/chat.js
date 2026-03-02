const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const weatherService = require("../services/weatherService");

// POST /api/chat — Main chat endpoint
router.post("/", async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Check if the message is weather-related
        const weatherKeywords = ["weather", "temperature", "forecast", "climate", "hot", "cold", "rain", "sunny"];
        const isWeatherQuery = weatherKeywords.some((kw) =>
            message.toLowerCase().includes(kw)
        );

        let weatherData = null;

        if (isWeatherQuery) {
            // Try to extract city name from the message
            const cityMatch = message.match(
                /(?:in|at|for|of)\s+([A-Z][a-zA-Z\s]+?)(?:\?|$|\.|\,)/i
            );
            const city = cityMatch ? cityMatch[1].trim() : "Vadodara";

            try {
                weatherData = await weatherService.getWeather(city);
            } catch (err) {
                console.error("Weather API error:", err.message);
            }
        }

        // Build enriched message if weather data is available
        let enrichedMessage = message;
        if (weatherData) {
            enrichedMessage = `${message}\n\n[SYSTEM CONTEXT: Current weather in ${weatherData.city}: ${weatherData.temperature}°C, ${weatherData.condition}, Humidity: ${weatherData.humidity}%, Wind: ${weatherData.windSpeed} km/h ${weatherData.windDirection}. Use this data to answer naturally.]`;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let reply;

        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            // Fallback when no API key
            if (weatherData) {
                reply = `The current temperature in ${weatherData.city} is ${weatherData.temperature}°C with ${weatherData.condition}. Humidity is at ${weatherData.humidity}% and wind is blowing at ${weatherData.windSpeed} km/h ${weatherData.windDirection}.`;
            } else {
                reply = getFallbackReply(message);
            }
        } else {
            reply = await aiService.chat(enrichedMessage, history);
        }

        res.json({ reply, weatherData });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({
            error: "Something went wrong processing your request.",
        });
    }
});

// GET /api/weather — Standalone weather endpoint
router.get("/weather", async (req, res) => {
    try {
        const city = req.query.city || "Vadodara";
        const weatherData = await weatherService.getWeather(city);
        res.json(weatherData);
    } catch (error) {
        console.error("Weather error:", error);
        res.status(500).json({ error: "Failed to fetch weather data." });
    }
});

function getFallbackReply(message) {
    const lower = message.toLowerCase();
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        return "Hello! I'm Jarvis, your personal AI assistant. How can I help you today?";
    }
    if (lower.includes("how are you")) {
        return "I'm doing great, thank you for asking. All systems are operational and I'm ready to assist you.";
    }
    if (lower.includes("your name") || lower.includes("who are you")) {
        return "I'm Jarvis, your personal AI assistant. I'm here to help you with questions, weather updates, and friendly conversation.";
    }
    if (lower.includes("time")) {
        return `The current time is ${new Date().toLocaleTimeString()}.`;
    }
    if (lower.includes("date")) {
        return `Today's date is ${new Date().toLocaleDateString()}.`;
    }
    if (lower.includes("thank")) {
        return "You're welcome! Always happy to assist.";
    }
    return "I'm here to help! You can ask me about the weather, the time, or just have a conversation. Note: For full AI capabilities, please configure the OpenAI API key.";
}

module.exports = router;
