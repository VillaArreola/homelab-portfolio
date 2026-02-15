"use client";

import { Bell, Network } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center px-4 gap-4 z-20 backdrop-blur-xl bg-slate-950/60">
      <div className="flex-1 flex items-center gap-2">
        <Network className="text-blue-500" size={20} />
        <h1 className="font-bold text-sm tracking-tight uppercase">
          Lab_Core v2.4
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            System Health
          </span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Optimal
          </span>
        </div>
        <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <Bell size={20} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}
