"use client";

export default function TranscriptDisplay({ transcript, status, onCancel }) {
    return (
        <div className="text-center space-y-4 max-w-lg z-20 animate-fade-in-up">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-2">
                {status === "listening" && (
                    <>
                        <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
                        <span>LISTENING...</span>
                    </>
                )}
                {status === "processing" && (
                    <>
                        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                        <span>PROCESSING...</span>
                    </>
                )}
                {status === "speaking" && (
                    <>
                        <span className="material-symbols-outlined text-[14px]">volume_up</span>
                        <span>SPEAKING...</span>
                    </>
                )}
                {status === "idle" && (
                    <>
                        <span className="material-symbols-outlined text-[14px]">mic</span>
                        <span>SAY &quot;JARVIS&quot; TO BEGIN</span>
                    </>
                )}
            </div>

            {/* Transcript */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-lg min-h-[60px]">
                {transcript ? (
                    <span>&ldquo;{transcript}&rdquo;</span>
                ) : (
                    <span className="text-slate-500 text-xl md:text-2xl font-normal">
                        Waiting for your command...
                    </span>
                )}
            </h1>

            {/* Audio Waveform Visualization */}
            {(status === "listening" || status === "speaking") && (
                <div className="flex items-center justify-center gap-1 h-8 mt-4">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-primary rounded-full wave-bar"
                            style={{
                                height: `${12 + Math.random() * 20}px`,
                                animationDelay: `${i * 0.1}s`,
                            }}
                        ></div>
                    ))}
                </div>
            )}

            {/* Processing dots */}
            {status === "processing" && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 bg-primary rounded-full typing-dot"></div>
                    ))}
                </div>
            )}

            {/* Cancel Button */}
            {status !== "idle" && (
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                        onClick={onCancel}
                        className="bg-surface hover:bg-red-500/20 hover:border-red-500/50 border border-border-dark text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all group cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-red-400 group-hover:text-red-500">close</span>
                        <span className="text-sm font-medium">Cancel Request</span>
                    </button>
                </div>
            )}
        </div>
    );
}
