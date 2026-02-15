"use client";

import { InfraItem } from "@/lib/infraTypes";
import { Server, Layers, Network, GitBranch, Package, X, Globe, ExternalLink, Edit2, Trash2, FileText, Code2, StickyNote, Maximize2, Minimize2, ChevronRight } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  node: InfraItem | null;
  onClose?: () => void;
  onEdit?: (node: InfraItem) => void;
  onDelete?: (nodeId: string) => void;
};

type TabType = "overview" | "documentation" | "configuration";

export default function NodePanel({ node, onClose, onEdit, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (!node) return null;
  
  // Auto-expand when viewing docs or config
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "documentation" || tab === "configuration") {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  };

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
  
  // Determine panel width based on state
  const getPanelWidth = () => {
    if (isCollapsed) return "w-0 md:w-0";
    if (isExpanded) return "w-full md:w-[700px] lg:w-[800px]";
    return "w-full md:w-[340px]";
  };

  return (
    <>
      {/* Show Panel Button (when collapsed) */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="
            fixed right-0 top-1/2 -translate-y-1/2 z-50
            hidden md:flex items-center justify-center
            w-10 h-20 rounded-l-lg
            bg-slate-800/90 border border-r-0 border-slate-700
            hover:bg-slate-700/90 hover:w-12
            transition-all duration-200
            text-slate-400 hover:text-slate-200
            shadow-lg backdrop-blur-sm
          "
          aria-label="Show panel"
          title="Show panel"
        >
          <Server size={20} />
        </button>
      )}
      
      {/* Panel */}
      <aside className={`
        ${getPanelWidth()}
        h-full backdrop-blur-xl bg-slate-900/70 border-l border-slate-800 
        overflow-y-auto transition-all duration-300 ease-in-out
        ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}>
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
          
          {/* Control Buttons */}
          <div className="flex items-center gap-1">
            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden md:block p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-300"
              aria-label={isExpanded ? "Normal width" : "Expand panel"}
              title={isExpanded ? "Normal width" : "Expand panel"}
            >
              {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            
            {/* Hide Panel Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:block p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-300"
              aria-label="Hide panel"
              title="Hide panel"
            >
              <ChevronRight size={18} />
            </button>
            
            {/* Close button for mobile */}
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
      </div>

      {/* ===== CONTENT ===== */}
      <div className="p-4 md:p-6 space-y-5">
        {/* Edit/Delete Actions (if handlers provided) */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pb-3 border-b border-slate-800">
            {onEdit && (
              <button
                onClick={() => onEdit(node)}
                className="
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  bg-purple-500/10 border border-purple-500/20
                  text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/30
                  transition-all text-sm font-medium
                "
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(node.id)}
                className="
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  bg-red-500/10 border border-red-500/20
                  text-red-400 hover:bg-red-500/20 hover:border-red-500/30
                  transition-all text-sm font-medium
                "
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}

        {/* ===== TABS ===== */}
        <div className="flex gap-1 p-1 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <button
            onClick={() => handleTabChange("overview")}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === "overview" 
                ? "bg-blue-500/20 border border-blue-500/30 text-blue-400" 
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              }
            `}
          >
            <Server size={16} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => handleTabChange("documentation")}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === "documentation" 
                ? "bg-purple-500/20 border border-purple-500/30 text-purple-400" 
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              }
            `}
          >
            <FileText size={16} />
            <span>Docs</span>
          </button>
          <button
            onClick={() => handleTabChange("configuration")}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === "configuration" 
                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" 
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              }
            `}
          >
            <Code2 size={16} />
            <span>Config</span>
          </button>
        </div>

        {/* ===== TAB CONTENT ===== */}
        {activeTab === "overview" && (
          <>
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
          </>
        )}

        {/* ===== DOCUMENTATION TAB ===== */}
        {activeTab === "documentation" && (
          <div className="space-y-4">
            {node.documentation ? (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Documentation
                  </h3>
                </div>
                <div className="pl-6 prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({...props}) => <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2" {...props} />,
                      h2: ({...props}) => <h2 className="text-lg font-bold text-slate-100 mt-3 mb-2" {...props} />,
                      h3: ({...props}) => <h3 className="text-base font-semibold text-slate-200 mt-3 mb-1" {...props} />,
                      p: ({...props}) => <p className="text-sm text-slate-300 mb-2" {...props} />,
                      ul: ({...props}) => <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 mb-2" {...props} />,
                      ol: ({...props}) => <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1 mb-2" {...props} />,
                      li: ({...props}) => <li className="text-slate-300" {...props} />,
                      code: ({className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="text-xs rounded-lg my-2"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="px-1.5 py-0.5 rounded bg-slate-800/70 text-blue-400 font-mono text-xs" {...props}>
                            {children}
                          </code>
                        );
                      },
                      a: ({...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                    }}
                  >
                    {node.documentation}
                  </ReactMarkdown>
                </div>
              </section>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">No documentation available</p>
                <p className="text-xs text-slate-600 mt-1">Add documentation in edit mode</p>
              </div>
            )}

            {node.notes && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Notes
                  </h3>
                </div>
                <div className="pl-6">
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{node.notes}</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ===== CONFIGURATION TAB ===== */}
        {activeTab === "configuration" && (
          <div className="space-y-4">
            {node.configuration ? (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Configuration
                  </h3>
                </div>
                <div className="pl-6">
                  <SyntaxHighlighter
                    language="bash"
                    style={vscDarkPlus}
                    customStyle={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    {node.configuration}
                  </SyntaxHighlighter>
                </div>
              </section>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Code2 className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">No configuration available</p>
                <p className="text-xs text-slate-600 mt-1">Add configuration in edit mode</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
