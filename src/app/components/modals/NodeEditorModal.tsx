"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit2, AlertCircle } from "lucide-react";
import { InfraItem } from "@/lib/infraTypes";

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
    type: "server",
    parent: undefined,
    layer: undefined,
    network: undefined,
    purpose: undefined,
    runtime: undefined,
    ip: undefined,
    dns: undefined,
    port: undefined,
    url: undefined,
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
          type: "server",
          parent: undefined,
          layer: undefined,
          network: undefined,
          purpose: undefined,
          runtime: undefined,
          ip: undefined,
          dns: undefined,
          port: undefined,
          url: undefined,
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
      type: "server",
      parent: undefined,
      layer: undefined,
      network: undefined,
      purpose: undefined,
      runtime: undefined,
      ip: undefined,
      dns: undefined,
      port: undefined,
      url: undefined,
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
              <label htmlFor="node-type" className="block text-sm font-medium text-slate-300 mb-2">
                Type *
              </label>
              <input
                id="node-type"
                type="text"
                value={formData.type}
                onChange={(e) => updateField("type", e.target.value)}
                placeholder="e.g., hypervisor, firewall, vm, container"
                className={`
                  w-full px-4 py-2.5 
                  bg-slate-800/50 border ${errors.type ? "border-red-500/50" : "border-slate-700"}
                  rounded-lg text-sm text-slate-200
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70
                  transition-all
                `}
              />
              {errors.type && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.type}
                </p>
              )}
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
