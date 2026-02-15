import { InfraItem, InfraTreeNode } from "@/lib/infraTypes";


export function buildInfraTree(items: InfraItem[]): InfraTreeNode[] {
  const map = new Map<string, InfraTreeNode>();

  // Crear nodos base
  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  const roots: InfraTreeNode[] = [];

  // Asignar hijos
  map.forEach((node) => {
    if (node.parent) {
      const parent = map.get(node.parent);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
