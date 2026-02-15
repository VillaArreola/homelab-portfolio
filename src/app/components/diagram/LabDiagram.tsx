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
import { Cloud, Shield, Server, Monitor } from "lucide-react";

type NodeData = {
  label: string;
  role: string;
  color: string;
  icon?: React.ReactNode;
};

const nodeTypes = {
  infra: InfraNode,
};

export default function LabDiagram() {
  const [selected, setSelected] = useState<any>(null);

  /* =========================
     TECHNICAL VIEW NODES
     ========================= */
  const initialNodes: Node<NodeData>[] = [
 {
  id: "oci",
  type: "infra",
  position: { x: 400, y: 120 },
  data: {
    label: "OCI Cloud",
    role: "Public Entry / Docker Host",
    color: "#0b1d33",
    icon: <Cloud size={28} />,
  },
},
    {
      id: "proxmox",
      type: "infra",
      position: { x: 400, y: 350 },
      data: {
        label: "Proxmox",
        role: "Hypervisor (Laptop)",
        color: "#312e81",
      },
    },
    {
      id: "pfsense",
      type: "infra",
      position: { x: 400, y: 520 },
      data: {
        label: "pfSense",
        role: "Firewall & Segmentation",
        color: "#3f1d1d",
      },
    },
    {
      id: "wazuh",
      type: "infra",
      position: { x: 200, y: 720 },
      data: {
        label: "Wazuh",
        role: "SIEM",
        color: "#064e3b",
      },
    },
    {
      id: "win11",
      type: "infra",
      position: { x: 350, y: 720 },
      data: {
        label: "Windows 11",
        role: "Endpoint + Sysmon",
        color: "#374151",
      },
    },
    {
      id: "kali",
      type: "infra",
      position: { x: 520, y: 720 },
      data: {
        label: "Kali Linux",
        role: "Offensive Lab",
        color: "#374151",
      },
    },
    {
      id: "ubuntu",
      type: "infra",
      position: { x: 680, y: 720 },
      data: {
        label: "Ubuntu Server",
        role: "Services",
        color: "#374151",
      },
    },
  ];

  /* =========================
     EDGES
     ========================= */
  const initialEdges: Edge[] = [
    { id: "e1", source: "oci", target: "proxmox" },
    { id: "e2", source: "proxmox", target: "pfsense" },
    { id: "e3", source: "pfsense", target: "wazuh" },
    { id: "e4", source: "pfsense", target: "win11" },
    { id: "e5", source: "pfsense", target: "kali" },
    { id: "e6", source: "pfsense", target: "ubuntu" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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

        <Legend />
      </div>

      {/* ===== SIDE PANEL ===== */}
      <NodePanel node={selected} />
    </div>
  );
}
