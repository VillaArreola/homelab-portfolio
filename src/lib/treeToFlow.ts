import { InfraTreeNode } from "@/lib/infraTypes";
import { Cloud, Server, HardDrive, Container, Shield, Monitor } from "lucide-react";
import { createElement } from "react";

const X_GAP = 220;
const Y_GAP = 160;

// Mapeo de colores según tipo
const typeColors: Record<string, string> = {
  "host": "#1e293b",
  "hypervisor": "#312e81",
  "vm": "#374151",
  "container-runtime": "#0b1d33",
  "cloud-host": "#0b1d33",
  "service": "#064e3b",
};

// Mapeo de íconos según tipo
function getIcon(type: string) {
  const iconMap: Record<string, any> = {
    "host": Server,
    "hypervisor": HardDrive,
    "vm": Monitor,
    "container-runtime": Container,
    "cloud-host": Cloud,
    "service": Shield,
  };
  
  const IconComponent = iconMap[type] || Server;
  return createElement(IconComponent, { size: 28 });
}

export function treeToReactFlow(
  roots: InfraTreeNode[]
) {
  const nodes: any[] = [];
  const edges: any[] = [];

  function traverse(
    node: InfraTreeNode,
    depth: number,
    index: number,
    parentId?: string
  ) {
    const x = index * X_GAP;
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

    node.children.forEach((child, i) =>
      traverse(child, depth + 1, index + i, node.id)
    );
  }

  roots.forEach((root, i) => traverse(root, 0, i * 3));

  return { nodes, edges };
}
