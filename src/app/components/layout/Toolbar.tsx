"use client";

import React, { useState } from "react";
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
  Maximize2,
  Search,
  X as XIcon,
  Plus,
  Download,
  Upload,
  Lock,
  Unlock,
  Database,
  Image,
  FileCode
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
  onSearch: (query: string) => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
  onAddNode: () => void;
  onExportTopology: () => void;
  onExportPNG: () => void;
  onExportMermaid: () => void;
  onImportTopology: () => void;
  onSavePermanently: () => void;
  onNewCanvas: () => void;
  onResetDiagram: () => void;
  isCustomMode: boolean;
}

export default function Toolbar({
  activeView,
  onViewChange,
  onSave,
  onReset,
  layoutMode,
  onLayoutModeChange,
  savedLayouts,
  isAdmin,
  onAdminLogin,
  onAddNode,
  onExportTopology,
  onExportPNG,
  onExportMermaid,
  onImportTopology,
  onSavePermanently,
  onNewCanvas,
  onResetDiagram,
  isCustomMode,
  onLoadLayout,
  onDeleteLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  onSearch,
}: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const views = viewsData as Record<
    string,
    { name: string; description: string; include: string[] }
  >;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClearSearch();
    }
  };

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
      {/* Search Section */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider">
          Search
        </span>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Find node..."
            suppressHydrationWarning
            className="
              w-full px-3 py-2 pl-9 pr-9
              bg-slate-800/50 border border-slate-700
              rounded-lg text-sm text-slate-200
              placeholder:text-slate-500
              focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
              transition-all
            "
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                p-1 rounded hover:bg-slate-700/50
                text-slate-500 hover:text-slate-300
                transition-all
              "
              aria-label="Clear search"
            >
              <XIcon size={14} />
            </button>
          )}
        </form>
      </div>

      {/* Node Editor Section */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Node Editor
          </span>
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <Unlock size={10} className="text-emerald-400" />
              <span className="text-[9px] text-emerald-400 font-medium">Admin</span>
            </div>
          ) : (
            <Lock size={10} className="text-slate-500" />
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          {/* New Canvas Button */}
          <button
            onClick={onNewCanvas}
            className="
              flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
              text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400
              border border-slate-700 hover:border-emerald-500/30
            "
          >
            <Layout size={18} />
            <span className="text-xs md:text-sm font-medium">New Canvas</span>
          </button>

          {/* Reset Diagram Button (only show in custom mode) */}
          {isCustomMode && (
            <button
              onClick={onResetDiagram}
              className="
                flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
                text-slate-400 hover:bg-orange-500/10 hover:text-orange-400
                border border-slate-700 hover:border-orange-500/30
              "
            >
              <RotateCcw size={18} />
              <span className="text-xs md:text-sm font-medium">Reset Diagram</span>
            </button>
          )}

          {/* Add Node Button */}
          <button
            onClick={onAddNode}
            className="
              flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
              text-slate-400 hover:bg-blue-500/10 hover:text-blue-400
            "
          >
            <Plus size={18} />
            <span className="text-xs md:text-sm font-medium">
              Add Node
            </span>
          </button>

          {/* Import Topology */}
          <button
            onClick={onImportTopology}
            className="
              flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
              text-slate-400 hover:bg-purple-500/10 hover:text-purple-400
            "
          >
            <Upload size={18} />
            <span className="text-xs md:text-sm font-medium">Import JSON</span>
          </button>

          {/* Export Topology */}
          <button
            onClick={onExportTopology}
            className="
              flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
              text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400
            "
          >
            <Download size={18} />
            <span className="text-xs md:text-sm font-medium">Export JSON</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={onExportPNG}
            className="
              flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
              text-slate-400 hover:bg-pink-500/10 hover:text-pink-400
            "
          >
            <Image size={18} />
            <span className="text-xs md:text-sm font-medium">Export PNG</span>
          </button>

          {/* Export Mermaid */}
          <button
            onClick={onExportMermaid}
            className="
              flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
              text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400
            "
          >
            <FileCode size={18} />
            <span className="text-xs md:text-sm font-medium">Export Mermaid</span>
          </button>

          {/* Save Permanently (Admin only) */}
          {isAdmin ? (
            <button
              onClick={onSavePermanently}
              className="
                flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
                bg-emerald-500/10 border border-emerald-500/20
                text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30
              "
            >
              <Database size={18} />
              <span className="text-xs md:text-sm font-medium">Save Permanently</span>
            </button>
          ) : (
            <button
              onClick={onAdminLogin}
              className="
                flex items-center gap-2 md:gap-3 p-2 rounded-lg w-full transition-all
                text-slate-400 hover:bg-orange-500/10 hover:text-orange-400
                border border-slate-700 hover:border-orange-500/30
              "
            >
              <Lock size={18} />
              <span className="text-xs md:text-sm font-medium">Admin Mode</span>
            </button>
          )}
        </div>
      </div>

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
