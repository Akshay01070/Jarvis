"use client";

export default function CoreVisualization({ status }) {
    const isActive = status === "listening" || status === "processing" || status === "speaking";

    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
            {/* Outer ring */}
            <div
                className={`absolute inset-0 border rounded-full transition-colors duration-500 ${isActive ? "border-primary/40" : "border-primary/20"
                    } animate-spin-slow`}
            ></div>

            {/* Middle ring - dashed */}
            <div
                className={`absolute inset-4 border rounded-full border-dashed transition-colors duration-500 ${isActive ? "border-primary/30" : "border-primary/10"
                    } animate-spin-reverse`}
                style={{ width: "85%", height: "85%", margin: "auto", inset: 0, position: "absolute" }}
            ></div>

            {/* Inner ring */}
            <div
                className="absolute border border-primary/5 rounded-full animate-spin-slow"
                style={{ width: "70%", height: "70%", animationDuration: "25s" }}
            ></div>

            {/* Core glow */}
            <div
                className={`absolute w-40 h-40 md:w-48 md:h-48 rounded-full transition-all duration-500 ${isActive
                        ? "bg-primary/30 blur-[60px]"
                        : "bg-primary/15 blur-[40px]"
                    } animate-pulse-glow`}
            ></div>

            {/* Diamond shape */}
            <div
                className={`relative w-32 h-32 md:w-40 md:h-40 border-2 diamond-rotate flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${isActive
                        ? "border-primary bg-primary/10 shadow-[0_0_40px_rgba(236,159,19,0.4)]"
                        : "border-primary/60 bg-primary/5 shadow-[0_0_20px_rgba(236,159,19,0.2)]"
                    }`}
            >
                {/* Inner diamond */}
                <div className="w-20 h-20 md:w-28 md:h-28 border border-primary/50 diamond-rotate"></div>

                {/* Cross lines */}
                <div className="absolute w-full h-[1px] bg-primary/40 top-1/2 left-0 -translate-y-1/2"></div>
                <div className="absolute h-full w-[1px] bg-primary/40 left-1/2 top-0 -translate-x-1/2"></div>

                {/* Center dot */}
                {isActive && (
                    <div className="absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(236,159,19,0.8)] diamond-inner"></div>
                )}
            </div>

            {/* Orbiting particles */}
            <div className="absolute w-full h-full" style={{ animation: "spin-slow 8s linear infinite" }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
            </div>
            <div className="absolute w-full h-full" style={{ animation: "spin-reverse 6s linear infinite" }}>
                <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(236,159,19,0.6)]"></div>
            </div>
            <div className="absolute w-full h-full" style={{ animation: "spin-slow 12s linear infinite" }}>
                <div className="absolute top-1/4 right-0 w-1 h-1 bg-secondary rounded-full shadow-[0_0_6px_rgba(19,91,236,0.5)]"></div>
            </div>
        </div>
    );
}
