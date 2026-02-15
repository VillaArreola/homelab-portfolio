"use client";

import React from "react";
import { 
  Save, 
  RotateCcw, 
  Eye, 
  Layout, 
  Trash2, 
  Clock,
  Shield,
  Workflow,
  Settings,
  Bell,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import viewsData from "@/data/views.json";
import { SavedLayout } from "@/lib/layoutStorage";

interface ToolbarProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
  onSave: () => void;
  onReset: () => void;
  layoutMode: "auto" | "manual";
  onLayoutModeChange: (mode: "auto" | "manual") => void;
  savedLayouts: SavedLayout[];
  onLoadLayout: (layoutId: string) => void;
  onDeleteLayout: (layoutId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}

export default function Toolbar({
  activeView,
  onViewChange,
  onSave,
  onReset,
  layoutMode,
  onLayoutModeChange,
  savedLayouts,
  onLoadLayout,
  onDeleteLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
}: ToolbarProps) {
  const views = viewsData as Record<
    string,
    { name: string; description: string; include: string[] }
  >;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getViewIcon = (viewId: string) => {
    const icons: Record<string, React.ReactElement> = {
      full: <Eye size={20} />,
      ceh: <Shield size={20} />,
      cloud: <Workflow size={20} />,
      proxmox: <Layout size={20} />,
    };
    return icons[viewId] || <Eye size={20} />;
  };

  return (
    <aside className="w-64 md:w-72 h-full border-r border-slate-800 p-3 md:p-4 flex flex-col gap-4 md:gap-6 backdrop-blur-xl bg-slate-950/60 z-20 overflow-y-auto">
      {/* Filters Section */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider">
            Filters
          </span>
          {Object.entries(views).map(([id, config]) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`
                flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all text-left
                ${
                  activeView === id
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/50"
                }
              `}
              title={config.description}
            >
              {getViewIcon(id)}
              <span className="text-xs md:text-sm font-medium truncate">{config.name}</span>
            </button>
          ))}
        </div>

        {/* Layout Actions */}
        <div className="pt-2 md:pt-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider">
            Layout
          </span>
          <button
            onClick={onSave}
            className="
              flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
              text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400
            "
          >
            <Save size={18} />
            <span className="text-xs md:text-sm font-medium">Save Layout</span>
          </button>
          <button
            onClick={onReset}
            className="
              flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
              text-slate-400 hover:bg-orange-500/10 hover:text-orange-400
            "
          >
            <RotateCcw size={18} />
            <span className="text-xs md:text-sm font-medium">Reset All</span>
          </button>
        </div>

        {/* Saved Layouts - Ocultar en m\u00f3viles */}
        {savedLayouts.length > 0 && (
          <div className="hidden md:flex pt-4 flex-col gap-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Saved Layouts
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {savedLayouts.length}/5
              </span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {savedLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className="
                    flex items-center gap-2 p-2 rounded-lg 
                    bg-slate-800/30 border border-slate-700/50
                    hover:border-cyan-500/50 transition-all group
                  "
                >
                  <button
                    onClick={() => onLoadLayout(layout.id)}
                    className="flex-1 text-left min-w-0"
                    title={`Load ${layout.name}`}
                  >
                    <div className="text-xs text-slate-200 truncate font-medium">
                      {layout.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {formatDate(layout.timestamp)}
                    </div>
                  </button>
                  <button
                    onClick={() => onDeleteLayout(layout.id)}
                    className="
                      opacity-0 group-hover:opacity-100 
                      p-1 hover:bg-red-500/20 rounded 
                      transition-all
                    "
                    title="Delete layout"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats - Ocultar en móviles */}
        <div className="hidden lg:flex pt-4 flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider">
            Quick Stats
          </span>
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-3 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Total RAM</span>
              <span className="text-xs font-mono">24GB+</span>
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[68%]"></div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">Containers</span>
              <span className="text-xs font-mono">14 Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Security</span>
              <span className="text-xs font-mono text-emerald-400">Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="mt-auto pt-3 md:pt-4 border-t border-slate-800 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider">
          View Controls
        </span>
        <div className="flex gap-2">
          <button
            onClick={onZoomOut}
            className="
              flex-1 flex items-center justify-center gap-2 p-2 rounded-lg
              text-slate-400 hover:bg-slate-800/50 hover:text-slate-300
              border border-slate-700/50 hover:border-slate-600
              transition-all
            "
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={onFitView}
            className="
              flex-1 flex items-center justify-center gap-2 p-2 rounded-lg
              text-slate-400 hover:bg-blue-500/10 hover:text-blue-400
              border border-slate-700/50 hover:border-blue-500/50
              transition-all
            "
            title="Fit View"
            aria-label="Fit View"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={onZoomIn}
            className="
              flex-1 flex items-center justify-center gap-2 p-2 rounded-lg
              text-slate-400 hover:bg-slate-800/50 hover:text-slate-300
              border border-slate-700/50 hover:border-slate-600
              transition-all
            "
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Layout Mode Toggle - Ocultar en móviles */}
      <div className="hidden md:block space-y-2 pt-3 md:pt-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider">
          Mode
        </span>
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
          <button
            onClick={() => onLayoutModeChange("auto")}
            className={`
              flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all
              ${
                layoutMode === "auto"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:text-slate-300"
              }
            `}
          >
            Auto
          </button>
          <button
            onClick={() => onLayoutModeChange("manual")}
            className={`
              flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all
              ${
                layoutMode === "manual"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:text-slate-300"
              }
            `}
          >
            Manual
          </button>
        </div>
      </div>
    </aside>
  );
}
