"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (password === adminPassword) {
      localStorage.setItem("isAdmin", "true");
      onSuccess();
      setPassword("");
      setError("");
    } else {
      setError("Contraseña incorrecta");
      setPassword("");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Lock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Admin Mode</h2>
              <p className="text-xs text-slate-400 mt-0.5">Unlock editor privileges</p>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300 mb-2">
              Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="
                w-full px-4 py-2.5 
                bg-slate-800/50 border border-slate-700
                rounded-lg text-sm text-slate-200
                placeholder:text-slate-500
                focus:outline-none focus:border-orange-500/50 focus:bg-slate-800/70
                transition-all
              "
              autoFocus
            />
            {error && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              type="submit"
              className="
                flex-1 px-4 py-2.5 rounded-lg
                bg-orange-500/20 border border-orange-500/30
                text-sm font-medium text-orange-400
                hover:bg-orange-500/30 hover:border-orange-500/50
                transition-all
              "
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
