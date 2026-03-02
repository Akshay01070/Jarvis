const axios = require("axios");

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/**
 * Fetch current weather for a given city.
 * @param {string} city - City name (e.g., "Vadodara")
 * @returns {Promise<Object>} Formatted weather data
 */
async function getWeather(city = "Vadodara") {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey || apiKey === "your_openweathermap_api_key_here") {
        // Return mock data when no API key is configured
        return {
            city: city,
            region: "Demo Mode",
            temperature: 30,
            condition: "Clear Skies",
            humidity: 45,
            windSpeed: 12,
            windDirection: "NW",
            icon: "01d",
        };
    }

    const response = await axios.get(BASE_URL, {
        params: {
            q: city,
            appid: apiKey,
            units: "metric",
        },
    });

    const data = response.data;

    return {
        city: data.name,
        region: data.sys.country,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
        windDirection: degToCompass(data.wind.deg),
        icon: data.weather[0].icon,
    };
}

function degToCompass(deg) {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
}

module.exports = { getWeather };
