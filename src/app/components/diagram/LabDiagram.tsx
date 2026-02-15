"use client";

import { useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

import InfraNode from "./InfraNode";
import NodePanel from "./NodePanel";
import Legend from "./Legend";
import { labNodes } from "@/data/labData";
import { RotateCcw } from "lucide-react";
import infraData from "@/data/infrastructure.json";
import { buildInfraTree } from "@/lib/buildTree";
import { treeToReactFlow } from "@/lib/treeToFlow";

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
  const [selected, setSelected] = useState<any>(null);

  // Generar nodos y aristas desde el JSON
  const tree = buildInfraTree(infraData);
  const flowData = treeToReactFlow(tree);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges);

  const handleReset = () => {
    const tree = buildInfraTree(infraData);
    const flowData = treeToReactFlow(tree);
    setNodes(flowData.nodes);
  };

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
          nodesDraggable={true}
          onNodeClick={(_, node) => {
            const data = labNodes[node.id];
            if (data) setSelected(data);
          }}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* Botón de Reset */}
        <button
          onClick={handleReset}
          className="
            absolute top-4 right-4 z-10
            flex items-center gap-2
            px-4 py-2
            bg-slate-800 hover:bg-slate-700
            text-white text-sm font-medium
            rounded-lg border border-slate-600
            shadow-lg
            transition-colors
          "
          title="Restaurar posiciones"
        >
          <RotateCcw size={16} />
          Reset
        </button>

        <Legend />
      </div>

      {/* ===== SIDE PANEL ===== */}
      <NodePanel node={selected} />
    </div>
  );
}
