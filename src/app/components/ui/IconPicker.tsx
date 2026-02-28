"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { ICON_REGISTRY, getRegistryIcon } from "@/lib/iconRegistry";

type IconPickerProps = {
  value: string | undefined;
  onChange: (key: string | undefined) => void;
};

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const selectedEntry = useMemo(
    () => ICON_REGISTRY.find((e) => e.key === value),
    [value]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return ICON_REGISTRY;
    const q = search.toLowerCase();
    return ICON_REGISTRY.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.key.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof ICON_REGISTRY> = {};
    for (const entry of filtered) {
      if (!map[entry.category]) map[entry.category] = [];
      map[entry.category].push(entry);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-2">
      {/* Selected preview strip */}
      {selectedEntry && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <span style={{ color: selectedEntry.brandColor }}>
            {getRegistryIcon(selectedEntry.key)}
          </span>
          <span className="text-sm font-medium text-slate-200 flex-1">
            {selectedEntry.label}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {selectedEntry.brandColor}
          </span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Clear icon"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons…"
          className="w-full pl-9 pr-8 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Scrollable icon grid */}
      <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/30 p-2 space-y-3">
        {Object.keys(grouped).length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4">No icons found</p>
        )}
        {Object.entries(grouped).map(([category, entries]) => (
          <div key={category}>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 px-1">
              {category}
            </p>
            <div className="grid grid-cols-5 gap-1">
              {entries.map((entry) => {
                const isSelected = entry.key === value;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => onChange(entry.key)}
                    title={entry.label}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg transition-colors
                      ${
                        isSelected
                          ? "bg-blue-500/20 ring-1 ring-blue-500/60"
                          : "hover:bg-slate-700/60"
                      }
                    `}
                  >
                    <span
                      style={{
                        color: isSelected ? entry.brandColor : undefined,
                      }}
                      className={isSelected ? "" : "text-slate-400"}
                    >
                      {getRegistryIcon(entry.key)}
                    </span>
                    <span
                      className="text-[9px] leading-tight text-center text-slate-400 truncate w-full"
                      style={{ fontSize: "9px" }}
                    >
                      {entry.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
