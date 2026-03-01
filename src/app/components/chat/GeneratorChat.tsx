"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { InfraItem } from "@/lib/infraTypes";
import { detectOffTopicGeneration } from "@/lib/chatHelpers";

interface GeneratorMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  generatedItems?: InfraItem[];
}

interface GeneratorChatProps {
  currentTopology: InfraItem[];
  onClose: () => void;
  onApplyTopology: (items: InfraItem[]) => void;
}

export default function GeneratorChat({ currentTopology, onClose, onApplyTopology }: GeneratorChatProps) {
  const [messages, setMessages] = useState<GeneratorMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingTopology, setPendingTopology] = useState<InfraItem[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const generateTopology = async () => {
    if (!input.trim() || isGenerating) return;

    const currentInput = input.trim();
    
    const userMessage: GeneratorMessage = {
      role: "user",
      content: currentInput,
      timestamp: getTimestamp(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);
    setError(null);

    // Guardrail: Check for off-topic prompts
    const offTopicCheck = detectOffTopicGeneration(currentInput);
    if (offTopicCheck.isOffTopic) {
      const errorMsg = "🚫 I can only generate infrastructure topologies (servers, VMs, networks, etc.). Please ask about homelab infrastructure.";
      setError(errorMsg);
      
      const errorMessage: GeneratorMessage = {
        role: "assistant",
        content: errorMsg,
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsGenerating(false);
      return;
    }

    try {
      // Build conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/generate-topology", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentInput,
          conversationHistory,
          currentTopology: currentTopology.length > 0 ? currentTopology : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const items: InfraItem[] = data.items || [];

      // Create preview text
      const nodeIds = items.slice(0, 5).map(n => n.id).join(", ");
      const moreText = items.length > 5 ? ` (+${items.length - 5} more)` : "";
      const previewText = `Generated ${items.length} node${items.length !== 1 ? 's' : ''}: ${nodeIds}${moreText}`;

      const assistantMessage: GeneratorMessage = {
        role: "assistant",
        content: previewText,
        timestamp: getTimestamp(),
        generatedItems: items,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setPendingTopology(items);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate topology";
      
      // Detectar tipos específicos de error y dar mensajes claros
      let userFriendlyError: string;
      
      if (errorMsg.includes("timeout") || errorMsg.includes("30 seconds") || errorMsg.includes("60 seconds")) {
        userFriendlyError = "⏱️ Generation timed out. Try a simpler description or check API status.";
      } else if (errorMsg.includes("Too Many Requests") || errorMsg.includes("429")) {
        userFriendlyError = "🚦 Rate limit reached. Please wait a moment and try again.";
      } else if (errorMsg.includes("Network") || errorMsg.includes("Failed to fetch")) {
        userFriendlyError = "🌐 Network error. Check your connection and try again.";
      } else if (errorMsg.includes("401") || errorMsg.includes("403")) {
        userFriendlyError = "🔑 Authentication error. Check API credentials.";
      } else {
        userFriendlyError = `❌ ${errorMsg}`;
      }
      
      setError(userFriendlyError);
      console.error("Generation error:", err);
      
      const errorMessage: GeneratorMessage = {
        role: "assistant",
        content: userFriendlyError,
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (items: InfraItem[]) => {
    onApplyTopology(items);
    setPendingTopology(null);
  };

  const handleDiscard = () => {
    setPendingTopology(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateTopology();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="w-[380px] bg-slate-900/95 backdrop-blur-xl border border-purple-700/50 shadow-2xl rounded-2xl flex flex-col">
      {/* Header con toggle */}
      <div 
        className="flex items-center justify-between px-3 py-2 border-b border-purple-700/50 rounded-t-2xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 cursor-pointer"
        onClick={toggleCollapse}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md animate-pulse"></div>
            <Sparkles className="text-purple-400 relative z-10" size={16} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200">Build Infrastructure 🏗️</h2>
            <p className="text-[9px] text-slate-500">AI-Powered Design</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
            title={isCollapsed ? "Expand" : "Collapse"}
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
            title="Close"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content - solo visible cuando no está colapsado */}
      {!isCollapsed && (
        <>
          {/* Messages Container */}
          <div className="h-[400px] overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                  <Sparkles className="text-purple-400 relative z-10" size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-200">Let's Build! 🚀</h3>
                  <p className="text-xs text-slate-400 leading-relaxed px-4">
                    Tell me what infrastructure you want to build. I'll help you design it step by step.
                  </p>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 space-y-2 mt-4 max-w-xs">
                  <p className="text-[10px] text-slate-500 font-medium">Examples:</p>
                  <div className="space-y-1 text-[9px] text-slate-400">
                    <p>• "Homelab with Proxmox and 2 Ubuntu VMs"</p>
                    <p>• "Add pfSense firewall with 3 VLANs"</p>
                    <p>• "Change VM IPs to 10.10.10.100-102"</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                        <Sparkles size={12} className="text-purple-400" />
                      </div>
                    )}
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-purple-500/10 border border-purple-500/20 text-slate-200"
                            : "bg-slate-800/50 border border-slate-700/50 text-slate-300"
                        }`}
                      >
                        {msg.content}
                        
                        {/* Show preview and actions for generated items */}
                        {msg.generatedItems && msg.generatedItems.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-2">
                            {/* Preview list */}
                            <div className="bg-slate-900/50 rounded-lg p-2 space-y-1">
                              {msg.generatedItems.slice(0, 5).map((item) => (
                                <div key={item.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span>
                                  <span className="font-mono text-purple-400">{item.id}</span>
                                  <span>→</span>
                                  <span className="text-slate-300">{item.name}</span>
                                  <span className="text-slate-600">({item.type})</span>
                                </div>
                              ))}
                              {msg.generatedItems.length > 5 && (
                                <p className="text-[10px] text-slate-600 ml-4">
                                  ... and {msg.generatedItems.length - 5} more
                                </p>
                              )}
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApply(msg.generatedItems!)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                              >
                                <CheckCircle size={12} />
                                Apply to Diagram
                              </button>
                              <button
                                onClick={handleDiscard}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-medium hover:bg-red-900/30 hover:text-red-400 hover:border-red-700/50 transition-all"
                                title="Discard this topology and continue refining"
                              >
                                Descartar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-600 px-1">{msg.timestamp}</span>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                        <span className="text-[10px]">👤</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isGenerating && (
                  <div className="flex gap-2 justify-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Sparkles size={12} className="text-purple-400" />
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 flex items-center gap-2">
                      <Loader2 size={12} className="text-purple-400 animate-spin" />
                      <span className="text-xs text-slate-400">Building your infrastructure...</span>
                    </div>
                  </div>
                )}

                {/* Error indicator */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-start gap-2">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-purple-700/50 p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your infrastructure..."
                disabled={isGenerating}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
              <button
                onClick={generateTopology}
                disabled={!input.trim() || isGenerating}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-1.5"
                title="Generate"
              >
                {isGenerating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
