import { InfraItem } from "./infraTypes";

/**
 * Convert infrastructure topology to Mermaid diagram syntax
 * @param topology Array of infrastructure items
 * @returns Mermaid flowchart code
 */
export function toMermaidDiagram(topology: InfraItem[]): string {
  const lines: string[] = [];
  
  // Header
  lines.push("flowchart TD");
  lines.push("");
  
  // Create node definitions with labels
  topology.forEach(item => {
    const label = item.name.replace(/"/g, "'");
    const nodeId = item.id.replace(/-/g, "_");
    
    // Choose shape based on type
    let shape = "[]"; // Default rectangle
    if (item.type === "firewall" || item.type === "router") {
      shape = "{}"; // Hexagon
    } else if (item.type === "cloud" || item.layer === "cloud") {
      shape = "((()))"; // Double circle
    } else if (item.type === "vm" || item.type === "container") {
      shape = "[]"; // Rectangle
    } else if (item.type === "network" || item.type === "subnet") {
      shape = "[()]"; // Stadium
    }
    
    const opening = shape[0] + (shape.length > 2 ? shape[1] : "");
    const closing = shape.length > 2 ? shape.slice(-2) : shape[1];
    
    lines.push(`    ${nodeId}${opening}"${label}"${closing}`);
  });
  
  lines.push("");
  
  // Create connections (parent-child relationships)
  topology.forEach(item => {
    if (item.parent) {
      const childId = item.id.replace(/-/g, "_");
      const parentId = item.parent.replace(/-/g, "_");
      lines.push(`    ${parentId} --> ${childId}`);
    }
  });
  
  lines.push("");
  
  // Add styling
  lines.push("    classDef physical fill:#3b82f6,stroke:#1e40af,color:#fff");
  lines.push("    classDef virtual fill:#8b5cf6,stroke:#6d28d9,color:#fff");
  lines.push("    classDef cloud fill:#f59e0b,stroke:#d97706,color:#fff");
  lines.push("");
  
  // Apply styles based on layer
  topology.forEach(item => {
    const nodeId = item.id.replace(/-/g, "_");
    if (item.layer === "physical") {
      lines.push(`    class ${nodeId} physical`);
    } else if (item.layer === "virtual") {
      lines.push(`    class ${nodeId} virtual`);
    } else if (item.layer === "cloud") {
      lines.push(`    class ${nodeId} cloud`);
    }
  });
  
  return lines.join("\n");
}
