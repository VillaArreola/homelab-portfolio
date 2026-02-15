import { Node } from "reactflow";

export interface NodePosition {
  x: number;
  y: number;
}

export interface LayoutData {
  [nodeId: string]: NodePosition;
}

export interface SavedLayout {
  id: string;
  name: string;
  timestamp: number;
  positions: LayoutData;
}

const MAX_LAYOUTS = 5;
const STORAGE_KEY = "lab-layouts";

/**
 * Obtiene todos los layouts guardados
 */
export const getSavedLayouts = (): SavedLayout[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading layouts:", error);
    return [];
  }
};

/**
 * Guarda un nuevo layout con nombre
 */
export const saveLayout = (nodes: Node[], name?: string): SavedLayout => {
  const positions: LayoutData = {};
  nodes.forEach((node) => {
    positions[node.id] = {
      x: node.position.x,
      y: node.position.y,
    };
  });

  const layouts = getSavedLayouts();
  const timestamp = Date.now();
  const layoutName = name || `Layout ${layouts.length + 1}`;

  const newLayout: SavedLayout = {
    id: `layout-${timestamp}`,
    name: layoutName,
    timestamp,
    positions,
  };

  // Agregar al inicio y mantener solo los últimos 5
  layouts.unshift(newLayout);
  const limitedLayouts = layouts.slice(0, MAX_LAYOUTS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedLayouts));
  return newLayout;
};

/**
 * Carga un layout específico por ID
 */
export const loadLayout = (layoutId: string): LayoutData | null => {
  const layouts = getSavedLayouts();
  const layout = layouts.find((l) => l.id === layoutId);
  return layout ? layout.positions : null;
};

/**
 * Carga el layout más reciente (para retrocompatibilidad)
 */
export const loadLastLayout = (): LayoutData | null => {
  const layouts = getSavedLayouts();
  return layouts.length > 0 ? layouts[0].positions : null;
};

/**
 * Elimina un layout específico
 */
export const deleteLayout = (layoutId: string): void => {
  const layouts = getSavedLayouts();
  const filtered = layouts.filter((l) => l.id !== layoutId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Elimina todos los layouts guardados
 */
export const clearAllLayouts = (): void => {
  localStorage.removeItem(STORAGE_KEY);
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
