"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FileCode, X, Upload, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { InfraItem } from "@/lib/infraTypes";
import { parseMermaidDiagram, MermaidParseResult } from "@/lib/mermaidImport";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: InfraItem[]) => void;
};

export default function MermaidImportModal({ isOpen, onClose, onImport }: Props) {
  const [activeTab, setActiveTab] = useState<"paste" | "file">("paste");
  const [code, setCode] = useState("");
  const [parseResult, setParseResult] = useState<MermaidParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced live parse on code change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!code.trim()) {
      setParseResult(null);
      setParseError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      try {
        const result = parseMermaidDiagram(code);
        setParseResult(result);
        setParseError(null);
      } catch (e) {
        setParseResult(null);
        setParseError(e instanceof Error ? e.message : "Error desconocido");
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode("");
      setParseResult(null);
      setParseError(null);
      setActiveTab("paste");
    }
  }, [isOpen]);

  const handleFileContent = useCallback((content: string) => {
    setCode(content);
    setActiveTab("paste");
  }, []);

  const handleFileInput = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) handleFileContent(content);
    };
    reader.readAsText(file);
  }, [handleFileContent]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileInput(file);
  }, [handleFileInput]);

  const handleImport = useCallback(() => {
    if (parseResult && parseResult.items.length > 0) {
      onImport(parseResult.items);
      onClose();
    }
  }, [parseResult, onImport, onClose]);

  if (!isOpen) return null;

  const nodeCount = parseResult?.items.length ?? 0;
  const parentCount = parseResult?.items.filter(i => i.parent).length ?? 0;
  const layerCount = parseResult?.items.filter(i => i.layer).length ?? 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <FileCode className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Importar desde Mermaid</h2>
              <p className="text-xs text-slate-400 mt-0.5">Pega código Mermaid o carga un archivo .mmd</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab("paste")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "paste"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            Pegar código
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "file"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            Cargar archivo
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
          {/* Paste tab */}
          {activeTab === "paste" && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`flowchart TD
    Laptop["Laptop"] --> Internet(("Internet"))
    Internet --> OCI[["OCI Cloud"]]
    OCI --> Proxmox["Proxmox Hypervisor"]
    Proxmox --> VM1["Ubuntu Server"]
    Proxmox --> VM2["Windows 11"]
    Proxmox --> pfSense["pfSense Firewall"]
    VM1 --> Docker["Docker"]
    Docker --> NPM["Nginx Proxy"]
    Docker --> Portainer["Portainer"]
    Docker --> DB[("PostgreSQL")]`}
              className="w-full h-48 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/70 transition-all resize-none"
              spellCheck={false}
              autoFocus
            />
          )}

          {/* File tab */}
          {activeTab === "file" && (
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                isDragOver
                  ? "border-purple-500/70 bg-purple-500/10"
                  : "border-slate-700 hover:border-purple-500/40 hover:bg-purple-500/5"
              }`}
            >
              <Upload size={32} className={isDragOver ? "text-purple-400" : "text-slate-500"} />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">Arrastra un archivo .mmd aquí</p>
                <p className="text-xs text-slate-500 mt-1">o haz clic para seleccionar</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mmd,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileInput(file);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* Error state */}
          {parseError && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{parseError}</p>
            </div>
          )}

          {/* Success + warnings */}
          {parseResult && !parseError && (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-400">
                  {nodeCount} nodos detectados — {parentCount} con padre — {layerCount} con capa
                </p>
              </div>
              {parseResult.warnings.length > 0 && (
                <div className="flex flex-col gap-1 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-400">Advertencias</span>
                  </div>
                  {parseResult.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-yellow-300/80 pl-5">• {w}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty hint */}
          {!code.trim() && !parseError && !parseResult && (
            <p className="text-xs text-slate-500 text-center">
              Acepta sintaxis Mermaid estándar (
              <code className="font-mono text-slate-400">flowchart TD</code>).{" "}
              Compatible con diagramas externos y con Export → Mermaid de este app.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!parseResult || nodeCount === 0}
            className="flex-1 px-4 py-2.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-sm font-medium text-purple-400 hover:bg-purple-500/30 hover:border-purple-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {parseResult && nodeCount > 0
              ? `Importar ${nodeCount} nodos`
              : "Importar"}
          </button>
        </div>
      </div>
    </div>
  );
}
