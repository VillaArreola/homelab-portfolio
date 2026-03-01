"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Sparkles, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { InfraItem } from "@/lib/infraTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: InfraItem[]) => void;
}

export default function AIGeneratorModal({ isOpen, onClose, onImport }: Props) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<InfraItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPrompt("");
      setResult(null);
      setError(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-topology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data.items || []);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate topology. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating]);

  const handleImport = useCallback(() => {
    if (result && result.length > 0) {
      onImport(result);
      onClose();
    }
  }, [result, onImport, onClose]);

  const handleRegenerate = useCallback(() => {
    setResult(null);
    setError(null);
    handleGenerate();
  }, [handleGenerate]);

  const handleTryAgain = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Sparkles size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Generate with AI</h2>
              <p className="text-xs text-slate-400 mt-0.5">Powered by LLM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Welcome message */}
          {!result && !error && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
              <p className="text-sm text-slate-300">
                👋 <strong>Hello!</strong> Tell me about your diagram or paste some Mermaid code to draw it for you...
              </p>
            </div>
          )}

          {/* Textarea for prompt */}
          {!result && !error && (
            <>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Example in English:
"Homelab with Proxmox hypervisor, 3 Ubuntu VMs running Docker containers (Nginx, Portainer, PostgreSQL), and pfSense firewall"

Ejemplo en Español:
"Infraestructura con Oracle Cloud, VM Ubuntu con Docker, contenedores Nginx Proxy Manager y base de datos MariaDB"

Or paste Mermaid code:
flowchart TD
    Laptop --> Internet
    Internet --> Cloud`}
                className="w-full h-48 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/70 transition-all resize-none"
                spellCheck={false}
                disabled={isGenerating}
              />

              {/* Example section */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-2">
                  💡 <strong>Tip:</strong> Be specific about infrastructure components, their relationships, and purposes.
                </p>
                <p className="text-xs text-slate-500">
                  The AI will generate a valid topology with proper parent-child relationships, types, and metadata.
                </p>
              </div>
            </>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 size={48} className="text-purple-400 animate-spin" />
              <p className="text-sm text-slate-400">Generating your topology...</p>
              <p className="text-xs text-slate-500">This may take up to 30 seconds</p>
            </div>
          )}

          {/* Success state */}
          {result && result.length > 0 && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-400">Generation successful!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Generated <strong>{result.length}</strong> node{result.length !== 1 ? "s" : ""} ready to import.
                  </p>
                </div>
              </div>

              {/* Preview count details */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-300 mb-2">Preview:</p>
                <div className="space-y-1">
                  {result.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-purple-500/50"></span>
                      <span className="font-mono text-slate-500">{item.id}</span>
                      <span>→</span>
                      <span className="text-slate-300">{item.name}</span>
                      <span className="text-slate-600">({item.type})</span>
                    </div>
                  ))}
                  {result.length > 5 && (
                    <p className="text-xs text-slate-600 ml-4">
                      ... and {result.length - 5} more
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20"
                >
                  <CheckCircle size={18} />
                  Import to Diagram
                </button>
                <button
                  onClick={handleRegenerate}
                  className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-all"
                  title="Generate again with same prompt"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">Generation failed</p>
                  <p className="text-xs text-slate-400 mt-1 break-words">{error}</p>
                </div>
              </div>

              <button
                onClick={handleTryAgain}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-all font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && !error && (
          <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Rate limit: 10 requests per minute
            </p>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
