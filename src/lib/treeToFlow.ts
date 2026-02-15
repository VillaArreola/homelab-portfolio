import { InfraTreeNode } from "@/lib/infraTypes";
import {
  Cloud,
  Server,
  HardDrive,
  Container,
  Shield,
  Monitor,
} from "lucide-react";
import { createElement } from "react";

const X_GAP = 220;
const Y_GAP = 160;

// ================================
// COLORES POR TIPO
// ================================
const typeColors: Record<string, string> = {
  host: "#1e293b",
  hypervisor: "#312e81",
  vm: "#374151",
  "container-runtime": "#0b1d33",
  "cloud-host": "#0b1d33",
  service: "#064e3b",
  subnet: "#1f2937",
};

// ================================
// ICONOS POR TIPO
// ================================
function getIcon(type: string) {
  const iconMap: Record<string, any> = {
    host: Server,
    hypervisor: HardDrive,
    vm: Monitor,
    "container-runtime": Container,
    "cloud-host": Cloud,
    service: Shield,
    subnet: Server,
  };

  const IconComponent = iconMap[type] || Server;
  return createElement(IconComponent, { size: 28 });
}

// ================================
// LAYOUT AUTOMÁTICO CENTRADO
// ================================
export function treeToReactFlow(roots: InfraTreeNode[]) {
  const nodes: any[] = [];
  const edges: any[] = [];

  let cursorX = 0;

  function layout(
    node: InfraTreeNode,
    depth: number,
    parentId?: string
  ): number {
    // ---------- HOJA ----------
    if (node.children.length === 0) {
      const x = cursorX;
      const y = depth * Y_GAP;

      nodes.push({
        id: node.id,
        type: "infra",
        position: { x, y },
        data: {
          label: node.name,
          role: node.purpose,
          color: typeColors[node.type] || "#374151",
          icon: getIcon(node.type),
        },
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
        });
      }

      cursorX += X_GAP;
      return x;
    }

    // ---------- NODO CON HIJOS ----------
    const childXs = node.children.map((child) =>
      layout(child, depth + 1, node.id)
    );

    const x =
      (Math.min(...childXs) + Math.max(...childXs)) / 2;
    const y = depth * Y_GAP;

    nodes.push({
      id: node.id,
      type: "infra",
      position: { x, y },
      data: {
        label: node.name,
        role: node.purpose,
        color: typeColors[node.type] || "#374151",
        icon: getIcon(node.type),
      },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
      });
    }

    return x;
  }

  // ================================
  // RESET ENTRE RAÍCES
  // ================================
  roots.forEach((root) => {
    layout(root, 0);
    cursorX += X_GAP * 2; // separación entre árboles (Laptop / OCI)
  });

  return { nodes, edges };
}
