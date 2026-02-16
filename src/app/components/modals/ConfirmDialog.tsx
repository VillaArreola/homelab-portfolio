"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-400" size={24} />,
      confirmBtn: "bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-300",
      iconBg: "bg-red-500/10",
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-400" size={24} />,
      confirmBtn: "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50 text-yellow-300",
      iconBg: "bg-yellow-500/10",
    },
    info: {
      icon: <CheckCircle className="text-blue-400" size={24} />,
      confirmBtn: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50 text-blue-300",
      iconBg: "bg-blue-500/10",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="
          relative z-10 w-full max-w-md
          bg-slate-900/95 backdrop-blur-xl
          border border-slate-700/50
          rounded-xl shadow-2xl
          animate-in zoom-in-95 duration-200
        "
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={`${styles.iconBg} p-2 rounded-lg shrink-0`}>
              {styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-100">
                {title}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="
                flex-1 px-4 py-2.5 rounded-lg
                bg-slate-800/50 hover:bg-slate-800
                border border-slate-700/50 hover:border-slate-600
                text-slate-300 hover:text-slate-100
                transition-all duration-200
                text-sm font-medium
              "
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`
                flex-1 px-4 py-2.5 rounded-lg
                border transition-all duration-200
                text-sm font-medium
                ${styles.confirmBtn}
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
