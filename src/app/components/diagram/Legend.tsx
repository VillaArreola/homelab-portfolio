export default function Legend() {
  return (
    <div className="absolute top-6 right-6 backdrop-blur-xl bg-slate-950/60 border border-slate-800 rounded-2xl p-4 z-20 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        <span className="text-xs font-medium text-slate-300">Healthy Node</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-xs font-medium text-slate-300">Attention Required</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="text-xs font-medium text-slate-300">Cloud Managed</span>
      </div>
    </div>
  );
}
