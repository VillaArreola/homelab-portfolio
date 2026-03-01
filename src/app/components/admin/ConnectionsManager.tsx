"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle } from "lucide-react";
import { CrossConnection, ConnectionType, InfraItem } from "@/lib/infraTypes";
import { validateConnection, VALID_CONNECTION_TYPES } from "@/lib/validateTopology";

interface ConnectionsManagerProps {
  connections: CrossConnection[];
  topology: InfraItem[];
  onConnectionsChange: (connections: CrossConnection[]) => void;
  onSave: (connections: CrossConnection[]) => Promise<void>;
}

interface ConnectionFormData  {
  from: string;
  to: string;
  type: ConnectionType;
  label: string;
  description: string;
  bidirectional: boolean;
}

export default function ConnectionsManager({
  connections,
  topology,
  onConnectionsChange,
  onSave,
}: ConnectionsManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>({
    from: "",
    to: "",
    type: "ssh",
    label: "",
    description: "",
    bidirectional: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      from: "",
      to: "",
      type: "ssh",
      label: "",
      description: "",
      bidirectional: false,
    });
    setIsEditing(false);
    setEditingIndex(null);
    setError(null);
  };

  const handleAdd = () => {
    setFormData({
      from: "",
      to: "",
      type: "ssh",
      label: "",
      description: "",
      bidirectional: false,
    });
    setEditingIndex(null);
    setError(null);
    setIsEditing(true);
  };

  const handleEdit = (index: number) => {
    const conn = connections[index];
    setFormData({
      from: conn.from,
      to: conn.to,
      type: conn.type,
      label: conn.label || "",
      description: conn.description || "",
      bidirectional: conn.bidirectional || false,
    });
    setIsEditing(true);
    setEditingIndex(index);
    setError(null);
  };

  const handleDelete = (index: number) => {
    if (confirm("Are you sure you want to delete this connection?")) {
      const updated = connections.filter((_, i) => i !== index);
      onConnectionsChange(updated);
      setSuccess("Connection deleted");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleSubmit = () => {
    setError(null);

    // Create connection object
    const newConnection: CrossConnection = {
      from: formData.from,
      to: formData.to,
      type: formData.type,
      label: formData.label || undefined,
      description: formData.description || undefined,
      bidirectional: formData.bidirectional || undefined,
    };

    // Validate
    const validation = validateConnection(newConnection, topology);
    if (!validation.valid) {
      setError(validation.errors.join("; "));
      return;
    }

    // Check for duplicates (except when editing the same connection)
    const isDuplicate = connections.some((conn, idx) => {
      if (editingIndex !== null && idx === editingIndex) return false;
      return conn.from === newConnection.from && conn.to === newConnection.to;
    });

    if (isDuplicate) {
      setError(`Duplicate connection: ${newConnection.from} → ${newConnection.to} already exists`);
      return;
    }

    // Update or add
    let updated: CrossConnection[];
    if (editingIndex !== null) {
      updated = connections.map((conn, idx) => (idx === editingIndex ? newConnection : conn));
      setSuccess("Connection updated");
    } else {
      updated = [...connections, newConnection];
      setSuccess("Connection added");
    }

    onConnectionsChange(updated);
    resetForm();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(connections);
      setSuccess("Connections saved to disk successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save connections");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-200">Manage Connections</h3>
          <p className="text-xs text-slate-400 mt-1">
            {connections.length} connection{connections.length !== 1 ? "s" : ""} defined
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Connection
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg transition-colors"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save to Disk"}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg">
          <CheckCircle size={16} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Form */}
      {isEditing && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">
              {editingIndex !== null ? "Edit Connection" : "New Connection"}
            </h4>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-200">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* From Node */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                From Node <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select source node...</option>
                {topology.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.id})
                  </option>
                ))}
              </select>
            </div>

            {/* To Node */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                To Node <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select target node...</option>
                {topology.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Connection Type <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ConnectionType })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {VALID_CONNECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Bidirectional */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bidirectional}
                  onChange={(e) => setFormData({ ...formData, bidirectional: e.target.checked })}
                  className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-slate-300">Bidirectional</span>
              </label>
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Encrypted Tunnel Active"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this connection..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              {editingIndex !== null ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Connections Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-300">From</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-slate-300">→</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-300">To</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-300">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-300">Label</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {connections.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                  No connections defined. Click "Add Connection" to create one.
                </td>
              </tr>
            ) : (
              connections.map((conn, index) => (
                <tr key={index} className="hover:bg-slate-750 transition-colors">
                  <td className="px-4 py-3 text-slate-200">
                    {topology.find((n) => n.id === conn.from)?.name || conn.from}
                    <span className="text-slate-500 text-xs ml-1">({conn.from})</span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    {conn.bidirectional ? "↔" : "→"}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {topology.find((n) => n.id === conn.to)?.name || conn.to}
                    <span className="text-slate-500 text-xs ml-1">({conn.to})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">
                      {conn.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {conn.label || <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit connection"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete connection"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
