"use client";

const weatherIcons = {
    "01d": "sunny",
    "01n": "dark_mode",
    "02d": "partly_cloudy_day",
    "02n": "partly_cloudy_night",
    "03d": "cloud",
    "03n": "cloud",
    "04d": "cloud",
    "04n": "cloud",
    "09d": "rainy",
    "09n": "rainy",
    "10d": "rainy",
    "10n": "rainy",
    "11d": "thunderstorm",
    "11n": "thunderstorm",
    "13d": "ac_unit",
    "13n": "ac_unit",
    "50d": "mist",
    "50n": "mist",
};

export default function WeatherCard({ weatherData, onRefresh }) {
    if (!weatherData) return null;

    const iconName = weatherIcons[weatherData.icon] || "sunny";

    return (
        <div className="w-full max-w-sm animate-fade-in-up">
            <div className="bg-surface/90 backdrop-blur-xl border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] transform transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(236,159,19,0.15)]">
                {/* Card Header */}
                <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm">cloud</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Weather Module</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">LIVE_FEED_003</span>
                </div>

                {/* Card Body */}
                <div className="p-5 relative">
                    {/* Background subtle gradient */}
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-primary/20 to-transparent z-0"></div>

                    <div className="relative z-10">
                        {/* City & Badge */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{weatherData.city}</h3>
                                <p className="text-slate-400 text-sm">{weatherData.region}</p>
                            </div>
                            <div className="bg-primary text-black font-bold px-2 py-1 rounded text-xs">
                                NOW
                            </div>
                        </div>

                        {/* Temperature */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="material-symbols-outlined text-5xl text-primary font-thin">{iconName}</span>
                            <div>
                                <span className="text-5xl font-bold text-white tracking-tighter">{weatherData.temperature}°</span>
                                <span className="text-xl text-slate-400 font-light">C</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400 text-sm">Condition</span>
                                <span className="text-white font-medium">{weatherData.condition}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400 text-sm">Humidity</span>
                                <span className="text-white font-medium">{weatherData.humidity}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Wind</span>
                                <span className="text-white font-medium">
                                    {weatherData.windSpeed} km/h {weatherData.windDirection}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="bg-black/20 p-3 flex gap-2">
                    <button
                        onClick={onRefresh}
                        className="flex-1 bg-primary text-black text-xs font-bold py-2 rounded hover:bg-primary/90 transition-colors uppercase cursor-pointer"
                    >
                        Refresh Data
                    </button>
                    <button className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-white transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm">share</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
