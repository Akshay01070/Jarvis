"use client";

export default function MicButton({ isListening, onClick, status }) {
    const isActive = isListening || status === "listening";

    return (
        <button
            onClick={onClick}
            className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer group ${isActive
                    ? "bg-primary/20 border-2 border-primary shadow-[0_0_30px_rgba(236,159,19,0.4)]"
                    : "bg-surface border-2 border-border-dark hover:border-primary/50 hover:shadow-[0_0_20px_rgba(236,159,19,0.2)]"
                }`}
            aria-label={isActive ? "Stop listening" : "Start listening"}
        >
            {/* Ping effect when active */}
            {isActive && (
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping-soft"></div>
            )}

            <span
                className={`material-symbols-outlined text-2xl md:text-3xl transition-colors duration-300 ${isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
                    }`}
            >
                {isActive ? "mic" : "mic_none"}
            </span>
        </button>
    );
}
