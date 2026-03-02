"use client";

export default function Footer() {
    return (
        <footer className="relative z-10 px-6 md:px-8 py-3 md:py-4 border-t border-border-dark glass flex flex-wrap justify-between items-center gap-3 text-[10px] md:text-xs font-mono text-slate-500 uppercase">
            <div className="flex gap-4 md:gap-6">
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">memory</span>
                    <span>CPU: 32%</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">storage</span>
                    <span>RAM: 4.5GB</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">network_check</span>
                    <span>PING: 12ms</span>
                </div>
            </div>
            <div className="flex gap-3 md:gap-4">
                <span className="hover:text-primary cursor-pointer transition-colors">Privacy Protocol</span>
                <span className="text-border-dark">|</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Diagnostic Tools</span>
                <span className="text-border-dark">|</span>
                <span>© 2024 Stark Industries</span>
            </div>
        </footer>
    );
}
