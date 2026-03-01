"use client";

import React, { useState } from "react";
import { X, Network, Settings } from "lucide-react";
import ConnectionsManager from "../admin/ConnectionsManager";
import { CrossConnection, InfraItem } from "@/lib/infraTypes";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopology: InfraItem[];
  currentConnections: CrossConnection[];
  onConnectionsChange: (connections: CrossConnection[]) => void;
  onSaveConnections: (connections: CrossConnection[]) => Promise<void>;
}

type TabId = "connections" | "settings";

export default function AdminDashboardModal({
  isOpen,
  onClose,
  currentTopology,
  currentConnections,
  onConnectionsChange,
  onSaveConnections,
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("connections");

  if (!isOpen) return null;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "connections", label: "Connections", icon: <Network size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-200">Admin Dashboard</h2>
            <p className="text-xs text-slate-400 mt-1">Manage infrastructure data</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
            aria-label="Close dashboard"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-800 text-purple-400 border-b-2 border-purple-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "connections" && (
            <ConnectionsManager
              connections={currentConnections}
              topology={currentTopology}
              onConnectionsChange={onConnectionsChange}
              onSave={onSaveConnections}
            />
          )}

          {activeTab === "settings" && (
            <div className="text-center text-slate-400 py-12">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Settings panel coming soon...</p>
              <p className="text-xs mt-2">Future features: Status editor, Views editor, Tags manager</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/30">
          <p className="text-xs text-slate-500">
            Changes are applied immediately. Click "Save to Disk" to persist.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
