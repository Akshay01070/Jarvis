"use client";

import { useState } from "react";

export default function Header({ status, onSettingsClick }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const statusColors = {
        idle: "bg-slate-500",
        listening: "bg-green-500",
        processing: "bg-primary",
        speaking: "bg-secondary",
        error: "bg-red-500",
    };

    const statusLabels = {
        idle: "Standby",
        listening: "Listening",
        processing: "Processing",
        speaking: "Speaking",
        error: "Error",
    };

    return (
        <header className="relative z-10 flex items-center justify-between px-6 md:px-8 py-4 border-b border-border-dark glass">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="text-primary animate-pulse">
                    <span className="material-symbols-outlined text-3xl">token</span>
                </div>
                <h2 className="text-white text-lg md:text-xl font-bold tracking-widest uppercase">
                    JARVIS{" "}
                    <span className="text-primary text-[10px] md:text-xs align-top">
                        OS 12.4.1
                    </span>
                </h2>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-8">
                <a className="text-primary text-sm font-medium uppercase tracking-wide cursor-pointer" href="#">
                    Home
                </a>
                <a className="text-slate-400 hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide cursor-pointer" href="#">
                    Commands
                </a>
                <a className="text-slate-400 hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide cursor-pointer" href="#">
                    System
                </a>
                <a className="text-slate-400 hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide cursor-pointer" href="#">
                    Logs
                </a>
            </nav>

            {/* Status + Settings */}
            <div className="flex items-center gap-3">
                <div className="relative flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColors[status] || statusColors.idle} animate-ping-soft absolute`}></div>
                    <div className={`h-2 w-2 rounded-full ${statusColors[status] || statusColors.idle} relative`}></div>
                    <span className="text-primary text-[10px] md:text-xs font-mono uppercase tracking-widest hidden sm:inline">
                        {statusLabels[status] || "Standby"}
                    </span>
                </div>

                <button
                    onClick={onSettingsClick}
                    className="w-10 h-10 rounded-full bg-surface border border-border-dark flex items-center justify-center ml-2 hover:border-primary/50 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-400 text-sm">settings</span>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden w-10 h-10 rounded-full bg-surface border border-border-dark flex items-center justify-center hover:border-primary/50 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                        {mobileMenuOpen ? "close" : "menu"}
                    </span>
                </button>
            </div>

            {/* Mobile Nav Dropdown */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 glass border-b border-border-dark p-4 flex flex-col gap-3 md:hidden z-50">
                    <a className="text-primary text-sm font-medium uppercase tracking-wide" href="#">Home</a>
                    <a className="text-slate-400 text-sm font-medium uppercase tracking-wide" href="#">Commands</a>
                    <a className="text-slate-400 text-sm font-medium uppercase tracking-wide" href="#">System</a>
                    <a className="text-slate-400 text-sm font-medium uppercase tracking-wide" href="#">Logs</a>
                </div>
            )}
        </header>
    );
}
