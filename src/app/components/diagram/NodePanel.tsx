"use client";

import { InfraItem } from "@/lib/infraTypes";

type Props = {
  node: InfraItem | null;
};

export default function NodePanel({ node }: Props) {
  if (!node) return null;

  return (
    <aside className="w-[320px] h-full bg-neutral-900 border-l border-neutral-700 p-4 text-white overflow-y-auto">
      {/* ===== TITLE ===== */}
      <h2 className="text-xl font-bold">{node.name}</h2>

      <div className="mt-6 space-y-6 text-sm text-neutral-300">
        {/* ===== TYPE ===== */}
        <section>
          <h3 className="text-xs uppercase tracking-wide text-neutral-400">
            Type
          </h3>
          <p className="mt-1">{node.type}</p>
        </section>

        {/* ===== PURPOSE ===== */}
        {node.purpose && (
          <section>
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Purpose
            </h3>
            <p className="mt-1">{node.purpose}</p>
          </section>
        )}

        {/* ===== LAYER ===== */}
        {node.layer && (
          <section>
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Layer
            </h3>
            <p className="mt-1 capitalize">{node.layer}</p>
          </section>
        )}

        {/* ===== NETWORK ===== */}
        {node.network && (
          <section>
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Network
            </h3>
            <p className="mt-1">{node.network}</p>
          </section>
        )}

        {/* ===== PARENT ===== */}
        {node.parent && (
          <section>
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Parent Node
            </h3>
            <p className="mt-1 capitalize">{node.parent}</p>
          </section>
        )}
      </div>
    </aside>
  );
}
