"use client";

import { ExternalLink } from "lucide-react";
import { InfraItem } from "@/lib/infraTypes";

type Props = {
  topology: InfraItem[];
  onSelectNode: (item: InfraItem) => void;
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    server: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    vm: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    container: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    service: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    network: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    storage: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    router: "bg-red-500/20 text-red-400 border-red-500/30",
    switch: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  };
  return colors[type?.toLowerCase()] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30";
};

const Dash = () => <span className="text-slate-600">—</span>;

export default function ServicesTable({ topology, onSelectNode }: Props) {
  const services = topology.filter(
    (item) => item.ip || item.dns || item.port || item.url
  );

  return (
    <div className="p-6 pt-16">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">
        Services{" "}
        <span className="text-slate-500 text-sm font-normal">({services.length})</span>
      </h2>
      <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">DNS / Hostname</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">IP</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Port</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">URL</th>
              <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">Parent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {services.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectNode(item)}
                className="hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-slate-200 font-medium">{item.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-400 font-mono text-xs">
                  {item.dns ?? <Dash />}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-400 font-mono text-xs">
                  {item.ip ?? <Dash />}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-slate-400 font-mono text-xs">
                  {item.port ?? <Dash />}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono text-xs transition-colors"
                    >
                      <span className="max-w-[180px] truncate">{item.url}</span>
                      <ExternalLink size={10} />
                    </a>
                  ) : <Dash />}
                </td>
                <td className="px-4 py-3 hidden xl:table-cell text-slate-400 text-xs">
                  {item.parent ?? <Dash />}
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  No services with network endpoints found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
