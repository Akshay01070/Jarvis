"use client";

import { useRef, useEffect } from "react";

export default function ChatPanel({ messages, isOpen, onClose }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Panel */}
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-surface border border-border-dark rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] animate-fade-in-up">
                {/* Panel Header */}
                <div className="bg-primary/10 px-5 py-3 border-b border-primary/20 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm">forum</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Conversation Log</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-slate-400 text-sm">close</span>
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-3 block">chat_bubble_outline</span>
                            <p className="text-sm">No conversations yet. Say &quot;Jarvis&quot; to start.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                        <span className="material-symbols-outlined text-primary text-sm">token</span>
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-primary/20 text-white border border-primary/20"
                                            : "bg-white/5 text-slate-200 border border-white/5"
                                        }`}
                                >
                                    {msg.content}
                                    <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
                                        {msg.timestamp || ""}
                                    </div>
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1">
                                        <span className="material-symbols-outlined text-secondary text-sm">person</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
