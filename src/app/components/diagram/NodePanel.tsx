"use client";

type NodeData = {
  title: string;
  role?: string;
  cpu?: string;
  ram?: string;
  os?: string;
  network?: string;
  services?: string[];
};

type Props = {
  node: NodeData | null;
};

export default function NodePanel({ node }: Props) {
  if (!node) return null;

  return (
    <aside className="w-[320px] h-full bg-neutral-900 border-l border-neutral-700 p-4 text-white overflow-y-auto">
      {/* ===== TITLE ===== */}
      <h2 className="text-xl font-bold">{node.title}</h2>

      <div className="mt-6 space-y-6 text-sm text-neutral-300">
        {/* ===== OVERVIEW ===== */}
        {node.role && (
          <section>
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Overview
            </h3>
            <p className="mt-1">{node.role}</p>
          </section>
        )}

        {/* ===== RESOURCES ===== */}
        {(node.cpu || node.ram || node.os) && (
          <section>
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Resources
            </h3>
            {node.cpu && <p>CPU: {node.cpu}</p>}
            {node.ram && <p>RAM: {node.ram}</p>}
            {node.os && <p>OS: {node.os}</p>}
          </section>
        )}

        {/* ===== NETWORK ===== */}
        {node.network && (
          <section>
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Network
            </h3>
            <p>{node.network}</p>
          </section>
        )}

        {/* ===== SERVICES ===== */}
        {node.services && node.services.length > 0 && (
          <section>
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Services
            </h3>
            <ul className="list-disc ml-4 mt-1 space-y-1">
              {node.services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}
