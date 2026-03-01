import { InfraItem } from "./infraTypes";

export type MermaidParseResult = {
  items: InfraItem[];
  warnings: string[];
};

// ── helpers ─────────────────────────────────────────────────────────────────

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

type NodePart = { id: string; label: string; shape: string };

/**
 * Parse one "segment" of an edge line (e.g. `A["label"]` or `B(("cloud"))`).
 * Returns null if the segment doesn't match any known pattern.
 */
function parseNodePart(part: string): NodePart | null {
  part = part.trim();
  let m: RegExpMatchArray | null;

  // id(("label")) → cloud / circle
  if ((m = part.match(/^(\w+)\(\("([^"]*)"\)\)$/)))
    return { id: m[1], label: stripHtml(m[2]), shape: "circle" };

  // id[("label")] → cylinder / network
  if ((m = part.match(/^(\w+)\[\("([^"]*)"\)\]$/)))
    return { id: m[1], label: stripHtml(m[2]), shape: "cylinder" };

  // id{{"label"}} or id{"label"} → rhombus / firewall
  if ((m = part.match(/^(\w+)\{+"([^"]*)"\}+$/)))
    return { id: m[1], label: stripHtml(m[2]), shape: "rhombus" };

  // id["label"] → rect / vm
  if ((m = part.match(/^(\w+)\["([^"]*)"\]$/)))
    return { id: m[1], label: stripHtml(m[2]), shape: "rect" };

  // id("label") → rounded / vm
  if ((m = part.match(/^(\w+)\("([^"]*)"\)$/)))
    return { id: m[1], label: stripHtml(m[2]), shape: "rounded" };

  // id[label without quotes] → rect / vm
  if ((m = part.match(/^(\w+)\[([^\]"]+)\]$/)))
    return { id: m[1], label: stripHtml(m[2]), shape: "rect" };

  // bare id → no label (reference only, don't auto-create)
  if ((m = part.match(/^(\w+)$/)))
    return { id: m[1], label: "", shape: "bare" };

  return null;
}

function shapeToType(shape: string): string {
  return (
    {
      circle: "cloud",
      rhombus: "firewall",
      cylinder: "network",
      rect: "vm",
      rounded: "vm",
    }[shape] ?? "vm"
  );
}

type Entry = {
  name: string;
  type: string;
  layer?: string;
  parentMermaidId?: string;
};

/**
 * Walk the parentMermaidId chain from `fromId` upward.
 * Returns true if `toId` appears in that chain (meaning assigning
 * toId.parentMermaidId = fromId would create a cycle).
 */
function wouldCreateCycle(
  fromId: string,
  toId: string,
  nodeMap: Map<string, Entry>
): boolean {
  let current: string | undefined = fromId;
  const visited = new Set<string>();
  while (current) {
    if (visited.has(current)) break;
    visited.add(current);
    if (current === toId) return true;
    current = nodeMap.get(current)?.parentMermaidId;
  }
  return false;
}

// ── main parser ──────────────────────────────────────────────────────────────

export function parseMermaidDiagram(code: string): MermaidParseResult {
  const trimmed = code.trim();
  if (!trimmed.toLowerCase().startsWith("flowchart"))
    throw new Error(
      "El código no es un diagrama Mermaid válido (debe comenzar con 'flowchart TD')"
    );

  const nodeMap = new Map<string, Entry>();
  const edges: { from: string; to: string }[] = [];
  const classes = new Map<string, string>(); // nodeId → className
  const warnings: string[] = [];

  // Helper: register or update a node (label wins if we see a labelled definition)
  function registerNode(part: NodePart) {
    if (part.shape === "bare") return; // bare refs don't auto-create nodes
    const existing = nodeMap.get(part.id);
    if (!existing) {
      nodeMap.set(part.id, {
        name: part.label,
        type: shapeToType(part.shape),
        ...(part.shape === "circle" ? { layer: "cloud" } : {}),
      });
    } else if (!existing.name && part.label) {
      // Fill in label if we now have one
      existing.name = part.label;
      existing.type = shapeToType(part.shape);
    }
  }

  for (const raw of trimmed.split("\n")) {
    const line = raw.trim();
    if (
      !line ||
      line.startsWith("flowchart") ||
      line.startsWith("%%") ||
      line.startsWith("classDef")
    )
      continue;

    // ── multi-node class: `class A,B,C className`
    {
      const m = line.match(/^class\s+([\w,\s]+)\s+(\w+)$/);
      if (m) {
        const ids = m[1].split(",").map((s) => s.trim()).filter(Boolean);
        const cls = m[2];
        for (const id of ids) classes.set(id, cls);
        continue;
      }
    }

    // ── edge line (contains `-->`)
    if (line.includes("-->")) {
      // Strip edge labels like -->|texto| → -->
      const stripped = line.replace(/-->\s*\|[^|]*\|/g, "-->").replace(/-->/g, " --> ");

      // Split on `-->` to get chain segments
      const parts = stripped.split(/\s*-->\s*/).map((s) => s.trim()).filter(Boolean);

      // Parse each segment, collect valid ones
      const parsed: NodePart[] = [];
      for (const seg of parts) {
        const np = parseNodePart(seg);
        if (np) {
          registerNode(np);
          parsed.push(np);
        }
      }

      // Record consecutive edges from the chain
      for (let i = 0; i < parsed.length - 1; i++) {
        edges.push({ from: parsed[i].id, to: parsed[i + 1].id });
      }
      continue;
    }

    // ── standalone node definition (no `-->`)
    {
      const np = parseNodePart(line);
      if (np && np.shape !== "bare") {
        registerNode(np);
      }
    }
  }

  if (nodeMap.size === 0)
    throw new Error("No se encontraron nodos en el diagrama");

  // ── edges → parent relationships (first edge wins, with cycle detection)
  for (const { from, to } of edges) {
    const child = nodeMap.get(to);
    if (!child) {
      // `to` was a bare ref and never got a labelled definition — skip silently
      continue;
    }
    if (!nodeMap.has(from)) {
      warnings.push(`Nodo padre "${from}" en arista no está definido`);
      continue;
    }
    if (!child.parentMermaidId) {
      if (wouldCreateCycle(from, to, nodeMap)) {
        warnings.push(`Arista "${from} → ${to}" crearía un ciclo — ignorada`);
      } else {
        child.parentMermaidId = from;
      }
    }
  }

  // ── class assignments → layer (and cloud type override)
  for (const [id, cls] of classes) {
    const node = nodeMap.get(id);
    if (!node) continue;
    if (["physical", "virtual", "cloud"].includes(cls)) {
      node.layer = cls;
      if (cls === "cloud" && node.type === "vm") node.type = "cloud";
    }
    // Unknown class names are silently ignored
  }

  // ── build InfraItem[]
  const toRealId = (s: string) => s.replace(/_/g, "-");
  const items: InfraItem[] = [];
  for (const [mid, e] of nodeMap) {
    items.push({
      id: toRealId(mid),
      name: e.name || mid,
      type: e.type,
      ...(e.layer ? { layer: e.layer } : {}),
      ...(e.parentMermaidId ? { parent: toRealId(e.parentMermaidId) } : {}),
    });
  }

  return { items, warnings };
}
