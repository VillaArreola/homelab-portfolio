"use client";

import { InfraItem } from "@/lib/infraTypes";
import { Server, Layers, Network, GitBranch, Package, X, Globe, ExternalLink } from "lucide-react";

type Props = {
  node: InfraItem | null;
  onClose?: () => void;
};

export default function NodePanel({ node, onClose }: Props) {
  if (!node) return null;

  // Badge color based on layer
  const getLayerColor = (layer?: string) => {
    switch (layer) {
      case "physical": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "virtual": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "cloud": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  // Generar texto para mostrar (IP/DNS + puerto)
  const getAccessText = () => {
    const host = node.dns || node.ip;
    if (!host) return null;
    
    if (node.port) {
      return `${host}:${node.port}`;
    }
    return host;
  };

  const accessText = getAccessText();

  return (
    <aside className="w-full md:w-[340px] h-full backdrop-blur-xl bg-slate-900/70 border-l border-slate-800 overflow-y-auto">
      {/* ===== HEADER ===== */}
      <div className="p-4 md:p-6 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Server className="w-5 h-5 text-blue-400" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base md:text-lg font-semibold text-slate-100 truncate">{node.name}</h2>
            <p className="text-xs text-slate-400 mt-1">Infrastructure Node</p>
          </div>
          {/* Bot\u00f3n cerrar para m\u00f3viles */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="p-4 md:p-6 space-y-5">
        {/* ===== TYPE ===== */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Type
            </h3>
          </div>
          <div className="pl-6">
            <span className="inline-flex items-center px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700 text-sm text-slate-200">
              {node.type}
            </span>
          </div>
        </section>

        {/* ===== LAYER ===== */}
        {node.layer && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Layer
              </h3>
            </div>
            <div className="pl-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-md border text-sm font-medium ${getLayerColor(node.layer)}`}>
                {node.layer}
              </span>
            </div>
          </section>
        )}

        {/* ===== PURPOSE ===== */}
        {node.purpose && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Purpose
              </h3>
            </div>
            <div className="pl-6">
              <p className="text-sm text-slate-300 leading-relaxed">{node.purpose}</p>
            </div>
          </section>
        )}

        {/* ===== ACCESS (IP/DNS + Port) ===== */}
        {accessText && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Access
              </h3>
            </div>
            <div className="pl-6">
              {node.url ? (
                <a
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-sm text-blue-400 font-mono hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group"
                >
                  <span>{accessText}</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              ) : (
                <code className="inline-flex items-center px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700 text-sm text-slate-300 font-mono">
                  {accessText}
                </code>
              )}
            </div>
          </section>
        )}

        {/* ===== NETWORK ===== */}
        {node.network && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Network
              </h3>
            </div>
            <div className="pl-6">
              <code className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-mono">
                {node.network}
              </code>
            </div>
          </section>
        )}

        {/* ===== PARENT ===== */}
        {node.parent && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Parent Node
              </h3>
            </div>
            <div className="pl-6">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700 text-sm text-slate-200 capitalize">
                {node.parent}
              </span>
            </div>
          </section>
        )}

        {/* ===== RUNTIME ===== */}
        {node.runtime && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Runtime
              </h3>
            </div>
            <div className="pl-6">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 font-medium">
                {node.runtime}
              </span>
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
