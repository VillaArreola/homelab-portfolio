import { InfraTreeNode, CrossConnection } from "@/lib/infraTypes";
import statusMap from "@/data/status.json";
import connectionsData from "@/data/connections.json";
import { getRegistryIcon } from "@/lib/iconRegistry";

import {
  Cloud,
  Server,
  HardDrive,
  Container,
  Shield,
  Monitor,
  Terminal,
  Network,
  Laptop,
  // Security
  Fingerprint,
  Lock,
  Key,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  FileKey,
  ScanFace,
  // Devices
  Smartphone,
  Tablet,
  Watch,
  Printer,
  Usb,
  Keyboard,
  Mouse,
  Webcam,
  Headphones,
  Speaker,
  // Coding & Development
  Code,
  Code2,
  Braces,
  FileCode,
  FileCode2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Package,
  Bug,
  TestTube,
  Webhook,
  Binary,
  Database,
  // AI & ML
  Brain,
  Sparkles,
  Bot,
  Cpu,
} from "lucide-react";
import { createElement } from "react";

const X_GAP = 220;
const Y_GAP = 160;

// ================================
// COLORES DE ICONOS POR TIPO/ID
// ================================
const iconColors: Record<string, string> = {
  // Hosts
  laptop: "#60a5fa", // blue-400
  host: "#60a5fa",
  
  // Cloud
  oci: "#f97316", // orange-500
  "cloud-host": "#f97316",
  
  // Hypervisors
  proxmox: "#ef4444", // red-500
  vmware: "#a855f7", // purple-500
  hypervisor: "#a855f7",
  
  // VMs
  kali: "#a855f7", // purple-500
  "windows-11": "#22d3ee", // cyan-400
  pfsense: "#10b981", // emerald-500
  wazuh: "#f59e0b", // amber-500
  "ubuntu-server": "#f97316", // orange-500
  vm: "#64748b", // slate-500
  
  // Containers
  "docker-local": "#3b82f6", // blue-500
  "docker-oci": "#3b82f6",
  "container-runtime": "#3b82f6",
  
  // Services
  npm: "#10b981", // emerald-500
  n8n: "#f97316", // orange-500
  portainer: "#22d3ee", // cyan-400
  service: "#10b981",
  
  // Subnets
  "ceh-subnet": "#a855f7", // purple-500
  subnet: "#64748b", // slate-500
  
  // Security
  security: "#ef4444", // red-500
  firewall: "#10b981", // emerald-500
  vpn: "#f59e0b", // amber-500
  authentication: "#8b5cf6", // violet-500
  encryption: "#06b6d4", // cyan-500
  scanner: "#ec4899", // pink-500
  ids: "#f43f5e", // rose-500
  ips: "#ef4444", // red-500
  fingerprint: "#8b5cf6", // violet-500
  
  // Devices
  smartphone: "#06b6d4", // cyan-500
  tablet: "#3b82f6", // blue-500
  watch: "#8b5cf6", // violet-500
  printer: "#64748b", // slate-500
  webcam: "#ec4899", // pink-500
  iot: "#10b981", // emerald-500
  keyboard: "#64748b", // slate-500
  mouse: "#64748b", // slate-500
  headphones: "#a855f7", // purple-500
  speaker: "#a855f7", // purple-500
  usb: "#f59e0b", // amber-500
  
  // Coding & Development
  code: "#a855f7", // purple-500
  git: "#f97316", // orange-500
  api: "#06b6d4", // cyan-500
  webhook: "#3b82f6", // blue-500
  package: "#10b981", // emerald-500
  testing: "#f59e0b", // amber-500
  ci: "#22d3ee", // cyan-400
  cd: "#10b981", // emerald-500
  bug: "#ef4444", // red-500
  binary: "#8b5cf6", // violet-500
  
  // AI & ML
  ai: "#8b5cf6", // violet-500
  llm: "#a855f7", // purple-500
  ml: "#7c3aed", // violet-600
  bot: "#ec4899", // pink-500
};

// ================================
// ICONOS POR TIPO
// ================================
function getIcon(type: string, id: string, customIconKey?: string) {
  // Custom icon from registry takes priority
  if (customIconKey) {
    const custom = getRegistryIcon(customIconKey);
    if (custom) return custom;
  }

  // Iconos específicos por ID
  if (id === "laptop") return createElement(Laptop, { size: 24, strokeWidth: 2 });
  if (id === "oci" || type === "cloud-host") return createElement(Cloud, { size: 24, strokeWidth: 2 });
  if (id === "kali") return createElement(Terminal, { size: 24, strokeWidth: 2 });
  if (id.includes("windows")) return createElement(Monitor, { size: 24, strokeWidth: 2 });
  if (id.includes("proxmox")) return createElement(Server, { size: 24, strokeWidth: 2 });
  if (id.includes("docker") || type === "container-runtime") return createElement(Container, { size: 24, strokeWidth: 2 });
  if (id.includes("pfsense")) return createElement(Shield, { size: 24, strokeWidth: 2 });

  // Iconos por tipo
  const iconMap: Record<string, any> = {
    host: Laptop,
    hypervisor: HardDrive,
    vm: Monitor,
    "container-runtime": Container,
    "cloud-host": Cloud,
    service: Network,
    subnet: Server,
    database: Database,
    
    // Security
    security: ShieldAlert,
    firewall: Shield,
    vpn: Lock,
    authentication: UserCheck,
    encryption: Key,
    scanner: ScanFace,
    ids: Eye,
    ips: ShieldCheck,
    fingerprint: Fingerprint,
    "file-encryption": FileKey,
    "eye-off": EyeOff,
    
    // Devices  
    smartphone: Smartphone,
    tablet: Tablet,
    watch: Watch,
    printer: Printer,
    webcam: Webcam,
    keyboard: Keyboard,
    mouse: Mouse,
    headphones: Headphones,
    speaker: Speaker,
    usb: Usb,
    iot: Cpu,
    
    // Coding & Development
    code: Code2,
    "code-simple": Code,
    git: GitBranch,
    "git-commit": GitCommit,
    "git-pr": GitPullRequest,
    api: Webhook,
    webhook: Webhook,
    package: Package,
    testing: TestTube,
    bug: Bug,
    binary: Binary,
    "file-code": FileCode2,
    braces: Braces,
    
    // AI & ML
    ai: Brain,
    llm: Sparkles,
    ml: Brain,
    bot: Bot,
  };

  const IconComponent = iconMap[type] || Server;
  return createElement(IconComponent, { size: 24, strokeWidth: 2 });
}

// ================================
// Obtener color del icono
// ================================
function getIconColor(type: string, id: string, customColor?: string): string {
  if (customColor) return customColor;
  // Primero intenta por ID específico
  if (iconColors[id]) return iconColors[id];
  // Luego por tipo
  if (iconColors[type]) return iconColors[type];
  // Default
  return "#64748b";
}

// ================================
// Helper de estado para nodos
function getStatus(id: string): "up" | "down" | "unknown" | "off" {
  const status = statusMap[id as keyof typeof statusMap];
  if (status === "up" || status === "down" || status === "off") {
    return status;
  }
  return "unknown";
}

// ================================
// LAYOUT AUTOMÁTICO CENTRADO
// ================================
export function treeToReactFlow(
  roots: InfraTreeNode[],
  connections: CrossConnection[] = connectionsData as CrossConnection[]
) {
  const nodes: any[] = [];
  const edges: any[] = [];

  let cursorX = 0;

  function layout(
    node: InfraTreeNode,
    depth: number,
    parentId?: string
  ): number {
    // ---------- HOJA ----------
    if (node.children.length === 0) {
      const x = cursorX;
      const y = depth * Y_GAP;

      nodes.push({
        id: node.id,
        type: "infra",
        position: { x, y },
        data: {
          label: node.name,
          role: node.purpose,
          color: getIconColor(node.type, node.id, node.iconColor),
          icon: getIcon(node.type, node.id, node.icon),
          status: getStatus(node.id),
          parent: parentId, // Agregar referencia al padre
          ip: node.ip,
          dns: node.dns,
          port: node.port,
        },
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
        });
      }

      cursorX += X_GAP;
      return x;
    }

    // ---------- NODO CON HIJOS ----------
    const childXs = node.children.map((child) =>
      layout(child, depth + 1, node.id)
    );

    const x =
      (Math.min(...childXs) + Math.max(...childXs)) / 2;
    const y = depth * Y_GAP;

    nodes.push({
      id: node.id,
      type: "infra",
      position: { x, y },
      data: {
        label: node.name,
        role: node.purpose,
        color: getIconColor(node.type, node.id, node.iconColor),
        icon: getIcon(node.type, node.id, node.icon),
        status: getStatus(node.id),
        parent: parentId, // Agregar referencia al padre
        ip: node.ip,
        dns: node.dns,
        port: node.port,
      },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
      });
    }

    return x;
  }

  // ================================
  // RESET ENTRE RAÍCES
  // ================================
  roots.forEach((root) => {
    layout(root, 0);
    cursorX += X_GAP * 2; // separación entre árboles (Laptop / OCI)
  });

  // ================================
  // AGREGAR CONEXIONES SSH
  // ================================
  connections.forEach((conn) => {
    // Verificar que ambos nodos existen
    const sourceExists = nodes.find(n => n.id === conn.from);
    const targetExists = nodes.find(n => n.id === conn.to);
    
    if (sourceExists && targetExists) {
      edges.push({
        id: `ssh-${conn.from}-${conn.to}`,
        source: conn.from,
        target: conn.to,
        type: 'default',
        animated: true,
        style: {
          stroke: '#3b82f6', // blue-500
          strokeWidth: 2,
          strokeDasharray: '5 5',
        },
        label: conn.label,
        labelStyle: {
          fill: '#60a5fa', // blue-400
          fontSize: 11,
          fontWeight: 500,
        },
        labelBgStyle: {
          fill: 'rgba(15, 23, 42, 0.8)', // slate-950 semi-transparent
          fillOpacity: 0.9,
        },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
      });
    }
  });

  return { nodes, edges };
}
