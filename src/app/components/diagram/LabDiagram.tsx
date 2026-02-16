"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
} from "reactflow";
import "reactflow/dist/style.css";
import { Menu, X, MessageSquare } from "lucide-react";

import InfraNode from "./InfraNode";
import NodePanel from "./NodePanel";
import Legend from "./Legend";
import Toolbar from "../layout/Toolbar";
import ChatWithInfra from "../chat/ChatWithInfra";
import AdminLoginModal from "../modals/AdminLoginModal";
import NodeEditorModal from "../modals/NodeEditorModal";
import ConfirmDialog from "../modals/ConfirmDialog";
import infraData from "@/data/infrastructure.json";
import viewsData from "@/data/views.json";
import { buildInfraTree } from "@/lib/buildTree";
import { treeToReactFlow } from "@/lib/treeToFlow";
import { toMermaidDiagram } from "@/lib/mermaidExport";
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
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Confirm Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Node Editor states
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"add" | "edit">("add");
  const [nodeToEdit, setNodeToEdit] = useState<InfraItem | undefined>(undefined);
  const [currentTopology, setCurrentTopology] = useState<InfraItem[]>([...infraData]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check admin status on mount
  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin");
    setIsAdmin(adminStatus === "true");
  }, []);

  // Generar nodos y aristas iniciales desde el JSON
  const tree = buildInfraTree(currentTopology);
  const initialFlowData = treeToReactFlow(tree);

  // Mantener todos los nodos y edges originales
  const [allNodes, setAllNodes] = useState<Node[]>(initialFlowData.nodes);
  const [allEdges, setAllEdges] = useState<Edge[]>(initialFlowData.edges);

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
    const nodeData = currentTopology.find((item) => item.id === node.id);
    if (nodeData) {
      setSelected(nodeData);
      setIsPanelOpen(true);
    }
  }, [currentTopology]);

  const handleSave = useCallback(() => {
    // Check if non-admin has reached 5 layouts limit
    const layouts = getSavedLayouts();
    if (!isAdmin && layouts.length >= 5) {
      setSaveMessage("⚠ Non-admin users can save up to 5 layouts");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }
    
    const newLayout = saveLayout(nodes);
    const updatedLayouts = getSavedLayouts();
    setSavedLayouts(updatedLayouts);
    setSaveMessage(`✓ ${newLayout.name} saved`);
    setTimeout(() => setSaveMessage(""), 2000);
  }, [nodes, isAdmin]);

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
    // Resetear topología a la original
    setCurrentTopology([...infraData]);
    const tree = buildInfraTree(infraData);
    const flowData = treeToReactFlow(tree);
    setAllNodes(flowData.nodes);
    setAllEdges(flowData.edges);
    setNodes(flowData.nodes);
    setEdges(flowData.edges);
    setActiveView("full");
    setLayoutMode("auto");
    setIsCustomMode(false); // Salir del modo custom
    setSaveMessage("✓ All layouts cleared");
    setTimeout(() => setSaveMessage(""), 2000);
  }, [setNodes, setEdges]);

  // New Canvas - Crear canvas vacío para que visitantes experimenten
  const handleNewCanvas = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: "Start New Canvas?",
      message: "This will clear the current diagram and let you create your own. You can restore the original anytime.",
      onConfirm: () => {
        setIsCustomMode(true);
        setCurrentTopology([]);
        setAllNodes([]);
        setAllEdges([]);
        setNodes([]);
        setEdges([]);
        setActiveView("full");
        setSaveMessage("✓ New canvas created - Add nodes to start");
        setTimeout(() => setSaveMessage(""), 3000);
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
      },
    });
  }, [setNodes, setEdges]);

  // Reset Diagram - Volver al diagrama original desde custom mode
  const handleResetDiagram = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: "Restore Original Diagram?",
      message: "This will discard your custom changes and restore the original lab structure.",
      onConfirm: () => {
        setIsCustomMode(false);
        setCurrentTopology([...infraData]);
        const tree = buildInfraTree(infraData);
        const flowData = treeToReactFlow(tree);
        setAllNodes(flowData.nodes);
        setAllEdges(flowData.edges);
        setNodes(flowData.nodes);
        setEdges(flowData.edges);
        setActiveView("full");
        setSaveMessage("✓ Original diagram restored");
        setTimeout(() => setSaveMessage(""), 2000);
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
      },
    });
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
        // Resetear topología a la original
        setCurrentTopology([...infraData]);
        const tree = buildInfraTree(infraData);
        const flowData = treeToReactFlow(tree);
        setAllNodes(flowData.nodes);
        setAllEdges(flowData.edges);
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

  // Búsqueda de nodos
  const handleSearch = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    const foundNode = nodes.find(node => 
      node.data.label?.toLowerCase().includes(lowerQuery) ||
      node.id.toLowerCase().includes(lowerQuery)
    );

    if (foundNode) {
      // Zoom hacia el nodo
      reactFlowInstance.setCenter(foundNode.position.x + 100, foundNode.position.y + 50, {
        zoom: 1.5,
        duration: 800,
      });

      // Seleccionar el nodo en el panel
      const nodeData = currentTopology.find((item) => item.id === foundNode.id);
      if (nodeData) {
        setSelected(nodeData);
        setIsPanelOpen(true);
      }
    }
  }, [nodes, reactFlowInstance, currentTopology]);

  // ===== NODE EDITOR FUNCTIONS =====
  
  // Admin login
  const handleAdminLogin = useCallback(() => {
    setIsAdminLoginOpen(true);
  }, []);

  const handleAdminLoginSuccess = useCallback(() => {
    setIsAdmin(true);
    setIsAdminLoginOpen(false);
    setSaveMessage("✓ Admin mode activated");
    setTimeout(() => setSaveMessage(""), 2000);
  }, []);

  // Add node
  const handleAddNode = useCallback(() => {
    setEditorMode("add");
    setNodeToEdit(undefined);
    setIsNodeEditorOpen(true);
  }, []);

  // Edit node (from panel)
  const handleEditNode = useCallback((node: InfraItem) => {
    setEditorMode("edit");
    setNodeToEdit(node);
    setIsNodeEditorOpen(true);
  }, []);

  // Save node (add or edit)
  const handleSaveNode = useCallback((node: InfraItem) => {
    setCurrentTopology(prev => {
      if (editorMode === "add") {
        // Add new node
        return [...prev, node];
      } else {
        // Edit existing node
        return prev.map(n => n.id === node.id ? node : n);
      }
    });
    setSaveMessage(`✓ Node ${editorMode === "add" ? "added" : "updated"}`);
    setTimeout(() => setSaveMessage(""), 2000);
  }, [editorMode]);

  // Delete node
  const handleDeleteNode = useCallback((nodeId: string) => {
    if (!confirm("Are you sure you want to delete this node?")) return;
    
    setCurrentTopology(prev => prev.filter(n => n.id !== nodeId));
    setSelected(null);
    setIsPanelOpen(false);
    setSaveMessage("✓ Node deleted");
    setTimeout(() => setSaveMessage(""), 2000);
  }, []);

  // Export topology as JSON
  const handleExportTopology = useCallback(() => {
    const dataStr = JSON.stringify(currentTopology, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `infrastructure-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSaveMessage("✓ Topology exported");
    setTimeout(() => setSaveMessage(""), 2000);
  }, [currentTopology]);

  // Export as PNG image
  const handleExportPNG = useCallback(() => {
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(
      nodesBounds,
      nodesBounds.width,
      nodesBounds.height,
      0.5,
      2,
      0.2
    );

    // Get the React Flow element
    const rfElement = document.querySelector('.react-flow') as HTMLElement;
    if (!rfElement) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 2; // Higher quality
    canvas.width = (nodesBounds.width + 200) * scale;
    canvas.height = (nodesBounds.height + 200) * scale;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#020617'; // slate-950 background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Use html2canvas alternative: take screenshot via foreignObject
    import('html-to-image').then(({ toPng }) => {
      toPng(rfElement, {
        backgroundColor: '#020617',
        width: nodesBounds.width + 200,
        height: nodesBounds.height + 200,
        style: {
          transform: `translate(${-nodesBounds.x + 100}px, ${-nodesBounds.y + 100}px) scale(${viewport.zoom})`,
        },
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `infrastructure-diagram-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          setSaveMessage("✓ PNG exported");
          setTimeout(() => setSaveMessage(""), 2000);
        })
        .catch((error) => {
          console.error('Export PNG error:', error);
          setSaveMessage("❌ PNG export failed");
          setTimeout(() => setSaveMessage(""), 2000);
        });
    });
  }, [nodes]);

  // Export as Mermaid diagram
  const handleExportMermaid = useCallback(() => {
    const mermaidCode = toMermaidDiagram(currentTopology);
    const dataBlob = new Blob([mermaidCode], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `infrastructure-diagram-${Date.now()}.mmd`;
    link.click();
    URL.revokeObjectURL(url);
    setSaveMessage("✓ Mermaid exported");
    setTimeout(() => setSaveMessage(""), 2000);
  }, [currentTopology]);

  // Import topology from JSON
  const handleImportTopology = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setCurrentTopology(json);
          setSaveMessage("✓ Topology imported");
          setTimeout(() => setSaveMessage(""), 2000);
        } else {
          alert("Invalid JSON format: must be an array");
        }
      } catch (error) {
        alert("Error parsing JSON file");
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Save permanently (admin only)
  const handleSavePermanently = useCallback(async () => {
    if (!isAdmin) {
      alert("Admin privileges required");
      return;
    }

    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    try {
      const response = await fetch("/api/save-infrastructure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topology: currentTopology,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage(`✓ Saved ${data.nodesCount} nodes permanently`);
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to save topology");
      console.error(error);
    }
  }, [isAdmin, currentTopology]);

  // Update the tree when topology changes
  useEffect(() => {
    const tree = buildInfraTree(currentTopology);
    const flowData = treeToReactFlow(tree);
    setAllNodes(flowData.nodes);
    setAllEdges(flowData.edges);
    setNodes(flowData.nodes);
    setEdges(flowData.edges);
  }, [currentTopology, setNodes, setEdges]);

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
          onSearch={handleSearch}
          isAdmin={isAdmin}
          onAdminLogin={handleAdminLogin}
          onNewCanvas={handleNewCanvas}
          onResetDiagram={handleResetDiagram}
          isCustomMode={isCustomMode}
          onAddNode={handleAddNode}
          onExportTopology={handleExportTopology}
          onExportPNG={handleExportPNG}
          onExportMermaid={handleExportMermaid}
          onImportTopology={handleImportTopology}
          onSavePermanently={handleSavePermanently}
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

        {/* Chat flotante - posicionado al lado del MiniMap */}
        <div className="absolute bottom-4 left-4 z-40">
          {isChatVisible ? (
            <div className="flex flex-col gap-2">
              <ChatWithInfra infrastructureData={currentTopology} />
              <button
                onClick={() => setIsChatVisible(false)}
                className="self-start px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl text-blue-400 hover:text-blue-300 hover:bg-slate-800/95 transition-all"
                title="Ocultar chat"
                aria-label="Ocultar chat"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChatVisible(true)}
                className="px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl text-blue-400 hover:text-blue-300 hover:bg-slate-800/95 transition-all"
                title="Mostrar chat"
                aria-label="Mostrar chat"
              >
                <MessageSquare size={18} />
              </button>
              <div className="px-4 py-2 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-slate-900/95 backdrop-blur-xl rounded-xl border border-blue-500/20 shadow-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">¡Hola! 👋</span>
                  <span className="text-xs text-slate-400">Pregúntame sobre la infraestructura</span>
                </div>
              </div>
            </div>
          )}
        </div>

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
              onEdit={handleEditNode}
              onDelete={handleDeleteNode}
            />
          </div>
        </>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Node Editor Modal */}
      <NodeEditorModal
        isOpen={isNodeEditorOpen}
        mode={editorMode}
        node={nodeToEdit}
        allNodes={currentTopology}
        onClose={() => setIsNodeEditorOpen(false)}
        onSave={handleSaveNode}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Continue"
        cancelText="Cancel"
        variant="warning"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })}
      />
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
