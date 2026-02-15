"use client";

import { Save, RotateCcw, Eye, Layout } from "lucide-react";
import viewsData from "@/data/views.json";

interface ToolbarProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
  onSave: () => void;
  onReset: () => void;
  layoutMode: "auto" | "manual";
  onLayoutModeChange: (mode: "auto" | "manual") => void;
}

export default function Toolbar({
  activeView,
  onViewChange,
  onSave,
  onReset,
  layoutMode,
  onLayoutModeChange,
}: ToolbarProps) {
  const views = viewsData as Record<
    string,
    { name: string; description: string; include: string[] }
  >;

  return (
    <div className="fixed right-6 top-24 w-56 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
      {/* Views Section */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-blue-400">Views</h3>
        </div>
        <div className="space-y-1">
          {Object.entries(views).map(([id, config]) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm
                transition-all duration-200
                ${
                  activeView === id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                    : "text-slate-300 hover:bg-slate-800 border border-transparent"
                }
              `}
              title={config.description}
            >
              <span className="mr-2">▸</span>
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions Section */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layout size={16} className="text-green-400" />
          <h3 className="text-sm font-semibold text-green-400">Actions</h3>
        </div>
        <div className="space-y-1">
          <button
            onClick={onSave}
            className="
              w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              text-slate-300 hover:bg-green-500/10 hover:text-green-300
              border border-transparent hover:border-green-500/50
              transition-all duration-200
            "
          >
            <Save size={14} />
            Save Layout
          </button>
          <button
            onClick={onReset}
            className="
              w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              text-slate-300 hover:bg-orange-500/10 hover:text-orange-300
              border border-transparent hover:border-orange-500/50
              transition-all duration-200
            "
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Layout Mode Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layout size={16} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-purple-400">Layout</h3>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => onLayoutModeChange("auto")}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-sm
              transition-all duration-200
              ${
                layoutMode === "auto"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                  : "text-slate-300 hover:bg-slate-800 border border-transparent"
              }
            `}
          >
            <span className="mr-2">▸</span>
            Auto
          </button>
          <button
            onClick={() => onLayoutModeChange("manual")}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-sm
              transition-all duration-200
              ${
                layoutMode === "manual"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                  : "text-slate-300 hover:bg-slate-800 border border-transparent"
              }
            `}
          >
            <span className="mr-2">▸</span>
            Manual
          </button>
        </div>
      </div>
    </div>
  );
}
