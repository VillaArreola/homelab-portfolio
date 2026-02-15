import { Node } from "reactflow";

export interface NodePosition {
  x: number;
  y: number;
}

export interface LayoutData {
  [nodeId: string]: NodePosition;
}

/**
 * Guarda las posiciones de los nodos en localStorage
 */
export const saveLayout = (nodes: Node[]): void => {
  const layout: LayoutData = {};
  nodes.forEach((node) => {
    layout[node.id] = {
      x: node.position.x,
      y: node.position.y,
    };
  });
  localStorage.setItem("lab-layout", JSON.stringify(layout));
};

/**
 * Carga las posiciones guardadas desde localStorage
 */
export const loadLayout = (): LayoutData | null => {
  try {
    const stored = localStorage.getItem("lab-layout");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading layout:", error);
    return null;
  }
};

/**
 * Elimina el layout guardado
 */
export const clearLayout = (): void => {
  localStorage.removeItem("lab-layout");
};

/**
 * Aplica las posiciones guardadas a los nodos
 */
export const applyLayout = (nodes: Node[], layout: LayoutData): Node[] => {
  return nodes.map((node) => ({
    ...node,
    position: layout[node.id] || node.position,
  }));
};
