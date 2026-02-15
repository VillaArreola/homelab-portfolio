"use client";

export default function Header() {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950 text-white flex items-center justify-between px-6">
      <div className="font-semibold tracking-wide">
        VillaArreola Lab
      </div>

      <nav className="flex items-center gap-6 text-sm text-neutral-400">
        <span className="hover:text-white cursor-default">
          Infrastructure
        </span>
        <span className="hover:text-white cursor-default">
          Security
        </span>
        <span className="hover:text-white cursor-default">
          Automation
        </span>
      </nav>
    </header>
  );
}
