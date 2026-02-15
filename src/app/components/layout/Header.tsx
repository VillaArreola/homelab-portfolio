"use client";

import { Network, Globe, Flag, Cat, Linkedin, Github, Mail } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b border-slate-800/50 flex items-center px-6 gap-6 z-20 backdrop-blur-xl bg-slate-950/80">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Network className="text-blue-400" size={20} strokeWidth={2.5} />
          <h1 className="font-bold text-base tracking-tight text-slate-100">
            VILLAARREOLA Lab
          </h1>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-1">
        <a
          href="https://www.villaarreola.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            text-sm font-medium text-slate-400
            hover:text-slate-200 hover:bg-slate-800/50
            transition-all duration-200
          "
        >
          <Globe size={16} />
          <span>Website</span>
        </a>
        <a
          href="https://ctf.villaarreola.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            text-sm font-medium text-slate-400
            hover:text-slate-200 hover:bg-slate-800/50
            transition-all duration-200
          "
        >
          <Flag size={16} />
          <span>CTF</span>
        </a>
        <a
          href="https://cats.villaarreola.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            text-sm font-medium text-slate-400
            hover:text-slate-200 hover:bg-slate-800/50
            transition-all duration-200
          "
        >
          <Cat size={16} />
          <span>Cats</span>
        </a>
      </nav>

      {/* System Status */}
      <div className="hidden lg:flex flex-col items-end pl-4 border-l border-slate-800/50">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          System
        </span>
        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Online
        </span>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-2 pl-4 border-l border-slate-800/50">
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            p-2 rounded-lg
            text-slate-400 hover:text-blue-400 hover:bg-slate-800/50
            transition-all duration-200
          "
          aria-label="LinkedIn"
          title="LinkedIn"
        >
          <Linkedin size={18} />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            p-2 rounded-lg
            text-slate-400 hover:text-slate-200 hover:bg-slate-800/50
            transition-all duration-200
          "
          aria-label="GitHub"
          title="GitHub"
        >
          <Github size={18} />
        </a>
        <a
          href="mailto:contact@villaarreola.com"
          className="
            p-2 rounded-lg
            text-slate-400 hover:text-orange-400 hover:bg-slate-800/50
            transition-all duration-200
          "
          aria-label="Email"
          title="Email"
        >
          <Mail size={18} />
        </a>
      </div>
    </header>
  );
}
