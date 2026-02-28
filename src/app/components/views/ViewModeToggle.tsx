"use client";

import { Network, Server, LayoutList } from "lucide-react";

export type MainView = "diagram" | "hardware" | "services";

type Props = {
  value: MainView;
  onChange: (v: MainView) => void;
};

const tabs: { id: MainView; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "diagram", label: "Diagram", Icon: Network },
  { id: "hardware", label: "Hardware", Icon: Server },
  { id: "services", label: "Services", Icon: LayoutList },
];

export default function ViewModeToggle({ value, onChange }: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 px-1 py-1 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${value === id
              ? "bg-slate-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
            }
          `}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
