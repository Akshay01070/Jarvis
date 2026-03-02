require("dotenv").config();
const express = require("express");
const cors = require("cors");

const chatRouter = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", chatRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "online",
        name: "JARVIS Backend",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🤖 JARVIS Backend online on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Chat:   http://localhost:${PORT}/api/chat`);
    console.log(
        `\n   Gemini Key: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here" ? "✅ Configured" : "⚠️  Not set"}`
    );
    console.log(
        `   Weather Key: ${process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== "your_openweathermap_api_key_here" ? "✅ Configured" : "⚠️  Not set"}\n`
    );
});
