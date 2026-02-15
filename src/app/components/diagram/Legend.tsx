export default function Legend() {
  return (
    <div className="absolute top-4 right-4 bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-md p-3 text-xs text-neutral-200 space-y-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-blue-500 rounded-sm" />
        <span>Cloud</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-sm" />
        <span>Security</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-purple-500 rounded-sm" />
        <span>Virtualization</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-gray-300 rounded-sm" />
        <span>Endpoints</span>
      </div>
    </div>
  );
}
