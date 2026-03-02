"use client";

import { useState } from "react";

export default function TextInput({ onSend, disabled }) {
    const [text, setText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSend(text.trim());
            setText("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-lg">
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a command..."
                    disabled={disabled}
                    className="w-full bg-surface border border-border-dark rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(236,159,19,0.1)] transition-all disabled:opacity-50"
                />
            </div>
            <button
                type="submit"
                disabled={disabled || !text.trim()}
                className="bg-primary hover:bg-primary/90 text-black px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <span className="material-symbols-outlined text-sm">send</span>
            </button>
        </form>
    );
}
