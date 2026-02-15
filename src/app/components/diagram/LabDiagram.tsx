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
      {/* Sidebar/Toolbar */}
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

      {/* ===== DIAGRAM AREA ===== */}
      <div className="flex-1 relative bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={layoutMode === "manual"}
          onNodeClick={(_, node) => {
            const nodeData = infraData.find((item) => item.id === node.id);
            if (nodeData) setSelected(nodeData);
          }}
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
      <NodePanel node={selected} />
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
