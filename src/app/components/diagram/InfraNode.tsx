import { Handle, Position } from "reactflow";

type Props = {
  data: {
    label: string;
    role?: string;
    color?: string;
    icon?: React.ReactNode;
    status?: "up" | "down" | "unknown" | "off";
  };
};

// ================================
// ESTILOS DE STATUS
// ================================
const statusStyles = {
  up: "border-emerald-500/50 shadow-emerald-500/20",
  down: "border-red-500/50 shadow-red-500/20",
  unknown: "border-slate-700/50",
  off: "border-slate-600/30 shadow-slate-600/10",
};

// Helper para convertir hex a rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function InfraNode({ data }: Props) {
  const status = data.status || "unknown";
  const iconColor = data.color || "#60a5fa";
  
  // Determinar si debe mostrar mensaje de alerta
  const showAlert = status === "down";
  const alertMessage = data.label.includes("Proxmox") ? "Check Storage" : "Attention Required";
  
  return (
    <div
      className={`
        relative
        backdrop-blur-xl bg-slate-900/70 
        rounded-2xl border shadow-lg
        transition-all hover:shadow-2xl hover:-translate-y-1
        ${statusStyles[status]}
        ${status === "down" ? "opacity-90" : ""}
        ${status === "off" ? "opacity-50 grayscale" : ""}
      `}
      style={{
        minWidth: 200,
      }}
    >
      {/* ===== DRAG HANDLE ===== */}
      <div
        className="
          flex items-center gap-3
          px-4 py-3
          cursor-grab
          active:cursor-grabbing
          select-none
        "
      >
        {/* Icono con background colorido */}
        {data.icon && (
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: hexToRgba(iconColor, 0.15),
              color: status === "down" ? "#ef4444" : iconColor,
            }}
          >
            {data.icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold leading-tight text-slate-100">
            {data.label}
          </div>
          {showAlert ? (
            <div className="text-[10px] text-red-400 leading-snug mt-0.5 font-medium">
              {alertMessage}
            </div>
          ) : data.role ? (
            <div className="text-[10px] text-slate-400 leading-snug mt-0.5">
              {data.role}
            </div>
          ) : null}
        </div>
      </div>

      {/* ===== STATUS INDICATOR ===== */}
      <div
        className={`
          absolute -top-1 -right-1
          w-3 h-3 rounded-full
          ${status === "up" ? "bg-emerald-400 animate-pulse" : ""}
          ${status === "down" ? "bg-red-500" : ""}
          ${status === "unknown" ? "bg-slate-500" : ""}
          ${status === "off" ? "bg-slate-600" : ""}
        `}
        title={`Status: ${status}`}
      />

      {/* ===== OFF LABEL ===== */}
      {status === "off" && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-700 rounded text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
          Off
        </div>
      )}

      {/* ===== CONNECTION POINTS ===== */}
      <Handle
        id="in"
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-slate-400 border-none"
      />
      <Handle
        id="out"
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-slate-400 border-none"
      />
    </div>
  );
}
