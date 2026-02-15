export default function Legend() {
  return (
    <div className="absolute top-4 md:top-6 right-4 md:right-6 backdrop-blur-xl bg-slate-950/60 border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 z-20 space-y-2 md:space-y-3 text-xs md:text-sm">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-emerald-400"></div>
        <span className="text-[10px] md:text-xs font-medium text-slate-300">Healthy Node</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-500"></div>
        <span className="text-[10px] md:text-xs font-medium text-slate-300">Attention Required</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-slate-600"></div>
        <span className="text-[10px] md:text-xs font-medium text-slate-300">Powered Off</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-blue-500"></div>
        <span className="text-[10px] md:text-xs font-medium text-slate-300">Cloud Managed</span>
      </div>
    </div>
  );
}
