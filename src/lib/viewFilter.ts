import { Node, Edge } from "reactflow";

export interface ViewConfig {
  name: string;
  description: string;
  include: string[];
  expandChildren?: boolean;
}

/**
 * Filtra nodos y edges según la configuración de vista
 */
export const applyView = (
  allNodes: Node[],
  allEdges: Edge[],
  viewConfig: ViewConfig
): { nodes: Node[]; edges: Edge[] } => {
  // Si incluye "*", mostrar todo
  if (viewConfig.include.includes("*")) {
    return { nodes: allNodes, edges: allEdges };
  }

  const visibleNodeIds = new Set<string>();

  // Agregar nodos incluidos explícitamente
  viewConfig.include.forEach((id) => {
    visibleNodeIds.add(id);

    // Si expandChildren está activado, agregar todos los descendientes
    if (viewConfig.expandChildren) {
      const addChildren = (parentId: string) => {
        allNodes.forEach((node) => {
          // Verificar si este nodo es hijo del padre actual
          if (node.parentId === parentId || node.data?.parent === parentId) {
            visibleNodeIds.add(node.id);
            // Recursivamente agregar hijos de este nodo
            addChildren(node.id);
          }
        });
      };
      addChildren(id);
    }
  });

  // Filtrar nodos
  const nodes = allNodes.filter((n) => visibleNodeIds.has(n.id));

  // Filtrar edges (solo mostrar edges entre nodos visibles)
  const edges = allEdges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  return { nodes, edges };
};

/**
 * Obtiene los IDs de los nodos raíz de una vista
 */
export const getViewRootNodes = (
  allNodes: Node[],
  viewConfig: ViewConfig
): Node[] => {
  if (viewConfig.include.includes("*")) {
    return allNodes.filter((n) => !n.parentId);
  }

  return allNodes.filter((n) => viewConfig.include.includes(n.id));
};
