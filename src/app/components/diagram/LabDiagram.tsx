"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  useReactFlow,
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
  loadLayout,
  clearLayout,
  applyLayout,
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

export default function LabDiagram() {
  const [selected, setSelected] = useState<InfraItem | null>(null);
  const [activeView, setActiveView] = useState<string>("full");
  const [layoutMode, setLayoutMode] = useState<"auto" | "manual">("manual");
  const [saveMessage, setSaveMessage] = useState<string>("");

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
    const savedLayout = loadLayout();
    if (savedLayout) {
      const nodesWithLayout = applyLayout(allNodes, savedLayout);
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
    saveLayout(nodes);
    setSaveMessage("✓ Layout saved");
    setTimeout(() => setSaveMessage(""), 2000);
  }, [nodes]);

  // Reset a layout automático
  const handleReset = useCallback(() => {
    clearLayout();
    const tree = buildInfraTree(infraData);
    const flowData = treeToReactFlow(tree);
    setAllNodes(flowData.nodes);
    setNodes(flowData.nodes);
    setEdges(flowData.edges);
    setActiveView("full");
    setLayoutMode("auto");
    setSaveMessage("✓ Layout reset");
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
        clearLayout();
        const tree = buildInfraTree(infraData);
        const flowData = treeToReactFlow(tree);
        setAllNodes(flowData.nodes);
        setNodes(flowData.nodes);
      }
    },
    [setNodes]
  );

  return (
    <div className="h-screen flex bg-neutral-950">
      {/* ===== DIAGRAM AREA ===== */}
      <div className="flex-1 relative">
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
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* Save Message Notification */}
        {saveMessage && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg animate-fade-in">
            {saveMessage}
          </div>
        )}

        {/* Toolbar */}
        <Toolbar
          activeView={activeView}
          onViewChange={handleViewChange}
          onSave={handleSave}
          onReset={handleReset}
          layoutMode={layoutMode}
          onLayoutModeChange={handleLayoutModeChange}
        />

        <Legend />
      </div>

      {/* ===== SIDE PANEL ===== */}
      <NodePanel node={selected} />
    </div>
  );
}
