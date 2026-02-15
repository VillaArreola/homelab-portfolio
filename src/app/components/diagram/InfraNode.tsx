import { Handle, Position } from "reactflow";

type Props = {
  data: {
    label: string;
    role?: string;
    color?: string;
    icon?: React.ReactNode;
    status?: "up" | "down" | "unknown";
  };
};

// ================================
// ESTILOS DE STATUS
// ================================
const statusStyles = {
  up: "bg-emerald-500 shadow-lg shadow-emerald-500/50",
  down: "bg-gray-500",
  unknown: "bg-yellow-400",
};

export default function InfraNode({ data }: Props) {
  const status = data.status || "unknown";
  
  return (
    <div
      className={`
        relative
        rounded-lg border shadow-lg text-sm transition
        hover:border-slate-300
        ${status === "down" ? "opacity-40 grayscale" : ""}
      `}
      style={{
        background: data.color ?? "#0f172a",
        borderColor: "#334155",
        color: "white",
        minWidth: 190,
      }}
    >
      {/* ===== DRAG HANDLE (ESTA ES LA CLAVE) ===== */}
      <div
        className="
          flex items-center gap-3
          px-4 py-3
          cursor-grab
          active:cursor-grabbing
          select-none
        "
      >
        {data.icon && (
          <div className="w-8 h-8 flex items-center justify-center">
            {data.icon}
          </div>
        )}

        <div>
          <div className="font-semibold leading-tight">
            {data.label}
          </div>
          {data.role && (
            <div className="text-xs text-slate-300 leading-snug">
              {data.role}
            </div>
          )}
        </div>
      </div>

      {/* ===== STATUS INDICATOR ===== */}
      <div
        className={`
          absolute -top-1 -right-1
          w-3 h-3 rounded-full
          ${statusStyles[status]}
        `}
        title={`Status: ${status}`}
      />

      {/* ===== CONNECTION POINTS ===== */}
      <Handle
        id="in"
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-slate-300 border-none"
      />
      <Handle
        id="out"
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-slate-300 border-none"
      />
    </div>
  );
}
