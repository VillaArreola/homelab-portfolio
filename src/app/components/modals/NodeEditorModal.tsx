"use client";

import { useState, useEffect } from "react";
import {
  X, Plus, Edit2, AlertCircle,
  // Icons for preview
  Cloud, Server, HardDrive, Container, Shield, Monitor, Terminal, Network, Laptop,
  Fingerprint, Lock, Key, ShieldAlert, ShieldCheck, Eye, UserCheck, ScanFace,
  Smartphone, Tablet, Watch, Printer, Webcam, Cpu,
  Keyboard, Mouse, Headphones, Speaker, Usb,
  Code2, GitBranch, GitCommit, GitPullRequest, Webhook, Package, TestTube, Bug, Binary,
  FileCode2, Braces,
  Brain, Sparkles, Bot, Wifi, Database
} from "lucide-react";
import { InfraItem } from "@/lib/infraTypes";
import IconPicker from "@/app/components/ui/IconPicker";
import { ICON_REGISTRY } from "@/lib/iconRegistry";

// Helper to get icon preview for a given type
const getTypeIconPreview = (type: string): { icon: React.ReactNode; color: string } => {
  const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
    // Infrastructure
    'host': { icon: <Laptop size={20} />, color: '#60a5fa' },
    'cloud-host': { icon: <Cloud size={20} />, color: '#f97316' },
    'hypervisor': { icon: <HardDrive size={20} />, color: '#a855f7' },
    'server': { icon: <Server size={20} />, color: '#ef4444' },
    'vm': { icon: <Monitor size={20} />, color: '#64748b' },
    'container-runtime': { icon: <Container size={20} />, color: '#3b82f6' },
    'storage': { icon: <HardDrive size={20} />, color: '#64748b' },
    'subnet': { icon: <Server size={20} />, color: '#64748b' },
    // Services
    'service': { icon: <Network size={20} />, color: '#10b981' },
    'database': { icon: <Database size={20} />, color: '#a855f7' },
    'api': { icon: <Webhook size={20} />, color: '#06b6d4' },
    'terminal': { icon: <Terminal size={20} />, color: '#a855f7' },
    // Security
    'firewall': { icon: <Shield size={20} />, color: '#10b981' },
    'vpn': { icon: <Lock size={20} />, color: '#f59e0b' },
    'security': { icon: <ShieldAlert size={20} />, color: '#ef4444' },
    'authentication': { icon: <UserCheck size={20} />, color: '#8b5cf6' },
    'encryption': { icon: <Key size={20} />, color: '#06b6d4' },
    'scanner': { icon: <ScanFace size={20} />, color: '#ec4899' },
    'ids': { icon: <Eye size={20} />, color: '#f43f5e' },
    'fingerprint': { icon: <Fingerprint size={20} />, color: '#8b5cf6' },
    // Devices
    'smartphone': { icon: <Smartphone size={20} />, color: '#06b6d4' },
    'tablet': { icon: <Tablet size={20} />, color: '#3b82f6' },
    'watch': { icon: <Watch size={20} />, color: '#8b5cf6' },
    'printer': { icon: <Printer size={20} />, color: '#64748b' },
    'webcam': { icon: <Webcam size={20} />, color: '#ec4899' },
    'keyboard': { icon: <Keyboard size={20} />, color: '#64748b' },
    'mouse': { icon: <Mouse size={20} />, color: '#64748b' },
    'headphones': { icon: <Headphones size={20} />, color: '#a855f7' },
    'speaker': { icon: <Speaker size={20} />, color: '#a855f7' },
    'usb': { icon: <Usb size={20} />, color: '#f59e0b' },
    'iot': { icon: <Cpu size={20} />, color: '#10b981' },
    'router': { icon: <Wifi size={20} />, color: '#22d3ee' },
    // Development
    'code': { icon: <Code2 size={20} />, color: '#a855f7' },
    'git': { icon: <GitBranch size={20} />, color: '#f97316' },
    'git-commit': { icon: <GitCommit size={20} />, color: '#f97316' },
    'git-pr': { icon: <GitPullRequest size={20} />, color: '#3b82f6' },
    'webhook': { icon: <Webhook size={20} />, color: '#3b82f6' },
    'package': { icon: <Package size={20} />, color: '#10b981' },
    'testing': { icon: <TestTube size={20} />, color: '#f59e0b' },
    'bug': { icon: <Bug size={20} />, color: '#ef4444' },
    'binary': { icon: <Binary size={20} />, color: '#8b5cf6' },
    'file-code': { icon: <FileCode2 size={20} />, color: '#06b6d4' },
    'braces': { icon: <Braces size={20} />, color: '#8b5cf6' },
    // AI & ML
    'ai': { icon: <Brain size={20} />, color: '#8b5cf6' },
    'llm': { icon: <Sparkles size={20} />, color: '#a855f7' },
    'ml': { icon: <Brain size={20} />, color: '#7c3aed' },
    'bot': { icon: <Bot size={20} />, color: '#ec4899' },
  };
  
  return iconMap[type] || { icon: <Server size={20} />, color: '#64748b' };
};

type Props = {
  isOpen: boolean;
  mode: "add" | "edit";
  node?: InfraItem;
  allNodes: InfraItem[];
  onClose: () => void;
  onSave: (node: InfraItem) => void;
};

export default function NodeEditorModal({ isOpen, mode, node, allNodes, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<InfraItem>>({
    id: "",
    name: "",
    type: "hypervisor",
    parent: undefined,
    layer: undefined,
    network: undefined,
    purpose: undefined,
    runtime: undefined,
    ip: undefined,
    dns: undefined,
    port: undefined,
    url: undefined,
    documentation: undefined,
    configuration: undefined,
    notes: undefined,
    tags: undefined,
    links: undefined,
    metadata: undefined,
    icon: undefined,
    iconColor: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && node) {
        setFormData(node);
      } else {
        setFormData({
          id: "",
          name: "",
          type: "hypervisor",
          parent: undefined,
          layer: undefined,
          network: undefined,
          purpose: undefined,
          runtime: undefined,
          ip: undefined,
          dns: undefined,
          port: undefined,
          url: undefined,
          documentation: undefined,
          configuration: undefined,
          notes: undefined,
          tags: undefined,
          links: undefined,
          metadata: undefined,
          icon: undefined,
          iconColor: undefined,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, node]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id?.trim()) {
      newErrors.id = "ID is required";
    } else if (mode === "add" && allNodes.some(n => n.id === formData.id)) {
      newErrors.id = "ID already exists";
    }

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.type?.trim()) {
      newErrors.type = "Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSave(formData as InfraItem);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      id: "",
      name: "",
      type: "hypervisor",
      parent: undefined,
      layer: undefined,
      network: undefined,
      purpose: undefined,
      runtime: undefined,
      ip: undefined,
      dns: undefined,
      port: undefined,
      url: undefined,
      documentation: undefined,
      configuration: undefined,
      notes: undefined,
      tags: undefined,
      links: undefined,
      metadata: undefined,
      icon: undefined,
      iconColor: undefined,
    });
    setErrors({});
    onClose();
  };

  const updateField = (field: keyof InfraItem, value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${mode === "add" ? "bg-blue-500/10 border border-blue-500/20" : "bg-purple-500/10 border border-purple-500/20"}`}>
              {mode === "add" ? <Plus className="w-5 h-5 text-blue-400" /> : <Edit2 className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {mode === "add" ? "Add New Node" : "Edit Node"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === "add" ? "Create a new infrastructure node" : "Modify node properties"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Required Fields</h3>
            
            {/* ID */}
            <div>
              <label htmlFor="node-id" className="block text-sm font-medium text-slate-300 mb-2">
                ID *
              </label>
              <input
                id="node-id"
                type="text"
                value={formData.id}
                onChange={(e) => updateField("id", e.target.value)}
                disabled={mode === "edit"}
                placeholder="e.g., proxmox, pfsense, docker-oci"
                className={`
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border ${errors.id ? "border-red-500/50" : "border-slate-700"}
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all
                  ${mode === "edit" ? "opacity-50 cursor-not-allowed" : ""}
                `}
              />
              {errors.id && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.id}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="node-name" className="block text-sm font-medium text-slate-300 mb-2">
                Name *
              </label>
              <input
                id="node-name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Proxmox VE, pfSense Firewall"
                className={`
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border ${errors.name ? "border-red-500/50" : "border-slate-700"}
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all
                `}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type *
              </label>
              {errors.type && (
                <p className="mb-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.type}
                </p>
              )}
              <div className={`rounded-lg border ${errors.type ? "border-red-500/50" : "border-slate-700"} bg-slate-800/30 p-3 space-y-3`}>
                {([
                  { label: "Infrastructure", types: [
                    { value: "host", name: "Host / Laptop" },
                    { value: "cloud-host", name: "Cloud Host" },
                    { value: "hypervisor", name: "Hypervisor" },
                    { value: "server", name: "Server" },
                    { value: "vm", name: "Virtual Machine" },
                    { value: "container-runtime", name: "Container" },
                    { value: "storage", name: "Storage" },
                    { value: "subnet", name: "Subnet" },
                  ]},
                  { label: "Services", types: [
                    { value: "service", name: "Service" },
                    { value: "database", name: "Database" },
                    { value: "api", name: "API" },
                    { value: "terminal", name: "Terminal" },
                  ]},
                  { label: "Security", types: [
                    { value: "firewall", name: "Firewall" },
                    { value: "vpn", name: "VPN" },
                    { value: "security", name: "Security" },
                    { value: "authentication", name: "Auth" },
                    { value: "encryption", name: "Encryption" },
                    { value: "scanner", name: "Scanner" },
                    { value: "ids", name: "IDS/IPS" },
                    { value: "fingerprint", name: "Biometric" },
                  ]},
                  { label: "Devices", types: [
                    { value: "smartphone", name: "Phone" },
                    { value: "tablet", name: "Tablet" },
                    { value: "watch", name: "Watch" },
                    { value: "printer", name: "Printer" },
                    { value: "webcam", name: "Webcam" },
                    { value: "keyboard", name: "Keyboard" },
                    { value: "mouse", name: "Mouse" },
                    { value: "headphones", name: "Headphones" },
                    { value: "speaker", name: "Speaker" },
                    { value: "usb", name: "USB" },
                    { value: "iot", name: "IoT" },
                    { value: "router", name: "Router" },
                  ]},
                  { label: "Development", types: [
                    { value: "code", name: "Code" },
                    { value: "git", name: "Git" },
                    { value: "git-commit", name: "Commit" },
                    { value: "git-pr", name: "Pull Request" },
                    { value: "webhook", name: "Webhook" },
                    { value: "package", name: "Package" },
                    { value: "testing", name: "Testing" },
                    { value: "bug", name: "Bug" },
                    { value: "binary", name: "Binary" },
                    { value: "file-code", name: "Code File" },
                    { value: "braces", name: "Code Block" },
                  ]},
                  { label: "AI & ML", types: [
                    { value: "ai", name: "AI System" },
                    { value: "llm", name: "LLM" },
                    { value: "ml", name: "ML" },
                    { value: "bot", name: "Bot" },
                  ]},
                ] as { label: string; types: { value: string; name: string }[] }[]).map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{group.label}</p>
                    <div className="grid grid-cols-4 gap-1">
                      {group.types.map((t) => {
                        const preview = getTypeIconPreview(t.value);
                        const isSelected = formData.type === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => updateField("type", t.value)}
                            className={`
                              flex flex-col items-center gap-1 p-2 rounded-lg border transition-all
                              ${isSelected
                                ? "border-blue-500/60 bg-blue-500/10 text-blue-400"
                                : "border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60 text-slate-400"
                              }
                            `}
                            title={t.name}
                          >
                            <div
                              className="flex items-center justify-center w-7 h-7 rounded-md"
                              style={{
                                backgroundColor: `${preview.color}22`,
                                color: isSelected ? preview.color : preview.color + "cc",
                              }}
                            >
                              {preview.icon}
                            </div>
                            <span className="text-[9px] font-medium leading-tight text-center line-clamp-1 w-full">
                              {t.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Brand logo override + color — shown right below the type grid */}
              <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-0.5">Brand Logo <span className="text-slate-600 font-normal">(optional override)</span></p>
                  <p className="text-[10px] text-slate-600 mb-2">Select a specific software logo to replace the type icon above.</p>
                  <IconPicker
                    value={formData.icon}
                    onChange={(key) => {
                      if (key) {
                        const entry = ICON_REGISTRY.find((e) => e.key === key);
                        setFormData((prev) => ({
                          ...prev,
                          icon: key,
                          iconColor: prev.iconColor || entry?.brandColor,
                        }));
                      } else {
                        setFormData((prev) => ({ ...prev, icon: undefined }));
                      }
                    }}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">Color <span className="text-slate-600 font-normal">(optional override)</span></p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.iconColor || "#64748b"}
                      onChange={(e) => updateField("iconColor", e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={formData.iconColor || ""}
                      onChange={(e) => updateField("iconColor", e.target.value)}
                      placeholder="#64748b"
                      maxLength={7}
                      className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                    {formData.iconColor && (
                      <button
                        type="button"
                        onClick={() => updateField("iconColor", undefined)}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Optional Fields</h3>
            
            {/* Parent */}
            <div>
              <label htmlFor="node-parent" className="block text-sm font-medium text-slate-300 mb-2">
                Parent Node
              </label>
              <select
                id="node-parent"
                value={formData.parent || ""}
                onChange={(e) => updateField("parent", e.target.value || undefined)}
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all
                "
              >
                <option value="">No parent (root node)</option>
                {allNodes.filter(n => n.id !== formData.id).map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                ))}
              </select>
            </div>

            {/* Layer */}
            <div>
              <label htmlFor="node-layer" className="block text-sm font-medium text-slate-300 mb-2">
                Layer
              </label>
              <select
                id="node-layer"
                value={formData.layer || ""}
                onChange={(e) => updateField("layer", e.target.value || undefined)}
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all
                "
              >
                <option value="">Select layer</option>
                <option value="physical">Physical</option>
                <option value="virtual">Virtual</option>
                <option value="cloud">Cloud</option>
              </select>
            </div>

            {/* Purpose */}
            <div>
              <label htmlFor="node-purpose" className="block text-sm font-medium text-slate-300 mb-2">
                Purpose / Description
              </label>
              <textarea
                id="node-purpose"
                value={formData.purpose || ""}
                onChange={(e) => updateField("purpose", e.target.value)}
                placeholder="Describe the node's role and purpose..."
                rows={3}
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all resize-none
                "
              />
            </div>

            {/* Network */}
            <div>
              <label htmlFor="node-network" className="block text-sm font-medium text-slate-300 mb-2">
                Network / CIDR
              </label>
              <input
                id="node-network"
                type="text"
                value={formData.network || ""}
                onChange={(e) => updateField("network", e.target.value)}
                placeholder="e.g., 10.10.10.0/24"
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all font-mono
                "
              />
            </div>

            {/* Runtime */}
            <div>
              <label htmlFor="node-runtime" className="block text-sm font-medium text-slate-300 mb-2">
                Runtime / Platform
              </label>
              <input
                id="node-runtime"
                type="text"
                value={formData.runtime || ""}
                onChange={(e) => updateField("runtime", e.target.value)}
                placeholder="e.g., Docker, Kubernetes, Proxmox"
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all
                "
              />
            </div>
          </div>

          {/* Access Information */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Access Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IP */}
              <div>
                <label htmlFor="node-ip" className="block text-sm font-medium text-slate-300 mb-2">
                  IP Address
                </label>
                <input
                  id="node-ip"
                  type="text"
                  value={formData.ip || ""}
                  onChange={(e) => updateField("ip", e.target.value)}
                  placeholder="e.g., 10.10.10.53"
                  className="
                    w-full px-4 py-2.5 
                    bg-slate-800/50 border border-slate-700
                    rounded-lg text-sm text-slate-200
                    placeholder:text-slate-500
                    focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                    transition-all font-mono
                  "
                />
              </div>

              {/* Port */}
              <div>
                <label htmlFor="node-port" className="block text-sm font-medium text-slate-300 mb-2">
                  Port
                </label>
                <input
                  id="node-port"
                  type="number"
                  value={formData.port || ""}
                  onChange={(e) => updateField("port", e.target.value ? parseInt(e.target.value) as any : undefined)}
                  placeholder="e.g., 8006"
                  className="
                    w-full px-4 py-2.5 
                    bg-slate-800/50 border border-slate-700
                    rounded-lg text-sm text-slate-200
                    placeholder:text-slate-500
                    focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                    transition-all font-mono
                  "
                />
              </div>
            </div>

            {/* DNS */}
            <div>
              <label htmlFor="node-dns" className="block text-sm font-medium text-slate-300 mb-2">
                DNS / Hostname
              </label>
              <input
                id="node-dns"
                type="text"
                value={formData.dns || ""}
                onChange={(e) => updateField("dns", e.target.value)}
                placeholder="e.g., hub.villaarreola.com"
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all font-mono
                "
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="node-url" className="block text-sm font-medium text-slate-300 mb-2">
                Full URL (for clickable links)
              </label>
              <input
                id="node-url"
                type="text"
                value={formData.url || ""}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="e.g., https://10.10.10.53:8006"
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all font-mono
                "
              />
            </div>
          </div>

          {/* Documentation */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Documentation</h3>
            
            {/* Documentation Field */}
            <div>
              <label htmlFor="node-documentation" className="block text-sm font-medium text-slate-300 mb-2">
                Documentation (Markdown supported)
              </label>
              <textarea
                id="node-documentation"
                value={formData.documentation || ""}
                onChange={(e) => updateField("documentation", e.target.value)}
                placeholder="## Setup Instructions\n\nDetailed documentation here...\n\n- Step 1\n- Step 2"
                rows={6}
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all font-mono resize-y
                "
              />
            </div>

            {/* Configuration Field */}
            <div>
              <label htmlFor="node-configuration" className="block text-sm font-medium text-slate-300 mb-2">
                Configuration / Commands
              </label>
              <textarea
                id="node-configuration"
                value={formData.configuration || ""}
                onChange={(e) => updateField("configuration", e.target.value)}
                placeholder="# Install Nginx\napt update && apt install nginx\n\n# Configuration\nvim /etc/nginx/nginx.conf"
                rows={5}
                className="
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all font-mono resize-y
                "
              />
            </div>

            {/* Notes Field */}
            <div>
              <label htmlFor="node-notes" className="block text-sm font-medium text-slate-300 mb-2">
                Notes / Troubleshooting
              </label>
              <textarea
                id="node-notes"
                value={formData.notes || ""}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Quick notes, troubleshooting tips, known issues..."
                rows={4}
                className="
                  w-full px-4 py-2.5
                  bg-slate-800/50 border border-slate-700
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all font-mono resize-y
                "
              />
            </div>
          </div>

        </form>

        {/* Footer - Fixed */}
        <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={handleClose}
            className="
              flex-1 px-4 py-2.5 rounded-lg
              bg-slate-800/50 border border-slate-700
              text-sm font-medium text-slate-300
              hover:bg-slate-800 hover:text-slate-200
              transition-all
            "
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`
              flex-1 px-4 py-2.5 rounded-lg
              ${mode === "add" 
                ? "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50" 
                : "bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 hover:border-purple-500/50"
              }
              text-sm font-medium
              transition-all
            `}
          >
            {mode === "add" ? "Add Node" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
