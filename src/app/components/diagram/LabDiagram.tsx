"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { Menu, X } from "lucide-react";

import InfraNode from "./InfraNode";
import NodePanel from "./NodePanel";
import Legend from "./Legend";
import Toolbar from "../layout/Toolbar";
import infraData from "@/data/infrastructure.json";
import viewsData from "@/data/views.json";
import { buildInfraTree } from "@/lib/buildTree";
import { treeToReactFlow } from "@/lib/treeToFlow";
import { InfraItem } from "@/lib/infraTypes";
import {
  saveLayout,
  loadLastLayout,
  clearAllLayouts,
  applyLayout,
  getSavedLayouts,
  loadLayout,
  deleteLayout,
  SavedLayout,
} from "@/lib/layoutStorage";
import { applyView, ViewConfig, getViewRootNodes } from "@/lib/viewFilter";

type NodeData = {
  label: string;
  role: string;
  color?: string;
  icon?: React.ReactNode;
};

const nodeTypes = {
  infra: InfraNode,
};

function DiagramContent() {
  const reactFlowInstance = useReactFlow();
  const [selected, setSelected] = useState<InfraItem | null>(null);
  const [activeView, setActiveView] = useState<string>("full");
  const [layoutMode, setLayoutMode] = useState<"auto" | "manual">("manual");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Generar nodos y aristas iniciales desde el JSON
  const tree = buildInfraTree(infraData);
  const initialFlowData = treeToReactFlow(tree);

  // Mantener todos los nodos y edges originales
  const [allNodes, setAllNodes] = useState<Node[]>(initialFlowData.nodes);
  const [allEdges] = useState<Edge[]>(initialFlowData.edges);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlowData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowData.edges);

  // Cargar layout guardado al montar
  useEffect(() => {
    const layouts = getSavedLayouts();
    setSavedLayouts(layouts);

    // Cargar el layout más reciente si existe
    const lastLayout = loadLastLayout();
    if (lastLayout) {
      const nodesWithLayout = applyLayout(allNodes, lastLayout);
      setAllNodes(nodesWithLayout);
      setNodes(nodesWithLayout);
      setLayoutMode("manual");
    }
  }, []);

  // Aplicar filtro de vista cuando cambia
  useEffect(() => {
    const views = viewsData as Record<string, ViewConfig>;
    const viewConfig = views[activeView];

    if (viewConfig) {
      const { nodes: filteredNodes, edges: filteredEdges } = applyView(
        allNodes,
        allEdges,
        viewConfig
      );
      setNodes(filteredNodes);
      setEdges(filteredEdges);
    }
  }, [activeView, allNodes, allEdges, setNodes, setEdges]);

  // Guardar layout
  // Toggle sidebar en móviles
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Manejar selección de nodo (abrir panel en móvil)
  const handleNodeClick = useCallback((_: any, node: Node) => {
    const nodeData = infraData.find((item) => item.id === node.id);
    if (nodeData) {
      setSelected(nodeData);
      setIsPanelOpen(true);
    }
  }, []);

  const handleSave = useCallback(() => {
    const newLayout = saveLayout(nodes);
    const layouts = getSavedLayouts();
    setSavedLayouts(layouts);
    setSaveMessage(`✓ ${newLayout.name} saved`);
    setTimeout(() => setSaveMessage(""), 2000);
  }, [nodes]);

  // Cargar un layout específico
  const handleLoadLayout = useCallback(
    (layoutId: string) => {
      const layoutData = loadLayout(layoutId);
      if (layoutData) {
        const nodesWithLayout = applyLayout(allNodes, layoutData);
        setAllNodes(nodesWithLayout);
        setNodes(nodesWithLayout);
        setLayoutMode("manual");
        setSaveMessage("✓ Layout loaded");
        setTimeout(() => setSaveMessage(""), 2000);
      }
    },
    [allNodes, setNodes]
  );

  // Eliminar un layout
  const handleDeleteLayout = useCallback((layoutId: string) => {
    deleteLayout(layoutId);
    const layouts = getSavedLayouts();
    setSavedLayouts(layouts);
    setSaveMessage("✓ Layout deleted");
    setTimeout(() => setSaveMessage(""), 2000);
  }, []);

  // Reset a layout automático
  const handleReset = useCallback(() => {
    clearAllLayouts();
    setSavedLayouts([]);
    const tree = buildInfraTree(infraData);
    const flowData = treeToReactFlow(tree);
    setAllNodes(flowData.nodes);
    setNodes(flowData.nodes);
    setEdges(flowData.edges);
    setActiveView("full");
    setLayoutMode("auto");
    setSaveMessage("✓ All layouts cleared");
    setTimeout(() => setSaveMessage(""), 2000);
  }, [setNodes, setEdges]);

  // Cambiar vista
  const handleViewChange = useCallback(
    (viewId: string) => {
      setActiveView(viewId);
    },
    []
  );

  // Cambiar modo de layout
  const handleLayoutModeChange = useCallback(
    (mode: "auto" | "manual") => {
      setLayoutMode(mode);
      if (mode === "auto") {
        clearAllLayouts();
        setSavedLayouts([]);
        const tree = buildInfraTree(infraData);
        const flowData = treeToReactFlow(tree);
        setAllNodes(flowData.nodes);
        setNodes(flowData.nodes);
      }
    },
    [setNodes]
  );

  // Controles de zoom
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn({ duration: 300 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut({ duration: 300 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ duration: 500, padding: 0.2 });
  }, [reactFlowInstance]);

  return (
    <div className="h-full flex bg-slate-950">
      {/* Bot\u00f3n hamburger para m\u00f3viles */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg backdrop-blur-xl bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-blue-400 transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay para cerrar sidebar en m\u00f3viles */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar/Toolbar */}
      <div className={`
        fixed lg:relative
        inset-y-0 left-0
        z-40 lg:z-auto
        transform lg:transform-none transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Toolbar
          activeView={activeView}
          onViewChange={handleViewChange}
          onSave={handleSave}
          onReset={handleReset}
          layoutMode={layoutMode}
          onLayoutModeChange={handleLayoutModeChange}
          savedLayouts={savedLayouts}
          onLoadLayout={handleLoadLayout}
          onDeleteLayout={handleDeleteLayout}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
        />
      </div>

      {/* ===== DIAGRAM AREA ===== */}
      <div className="flex-1 relative bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={layoutMode === "manual"}
          onNodeClick={handleNodeClick}
          fitView
        >
          <MiniMap 
            nodeStrokeWidth={2}
            zoomable
            pannable
            maskColor="rgba(15, 23, 42, 0.4)"
            style={{
              borderRadius: '1rem',
            }}
            className="hidden md:block"
          />
          <Background 
            gap={24}
            size={0}
            color="transparent"
          />
        </ReactFlow>

        {/* Save Message Notification */}
        {saveMessage && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-emerald-500 text-white rounded-lg shadow-lg animate-fade-in font-medium text-sm">
            {saveMessage}
          </div>
        )}

        <Legend />
      </div>

      {/* ===== SIDE PANEL ===== */}
      {/* Panel modal en móviles, fixed en desktop */}
      {selected && (
        <>
          {/* Overlay para cerrar panel en móviles */}
          {isPanelOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsPanelOpen(false)}
            />
          )}
          
          <div className={`
            fixed md:relative
            inset-y-0 right-0
            z-50 md:z-auto
            transform md:transform-none transition-transform duration-300
            ${isPanelOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}>
            <NodePanel 
              node={selected} 
              onClose={() => {
                setSelected(null);
                setIsPanelOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function LabDiagram() {
  return (
    <ReactFlowProvider>
      <DiagramContent />
    </ReactFlowProvider>
  );
}
