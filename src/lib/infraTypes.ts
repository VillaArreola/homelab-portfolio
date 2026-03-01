export type InfraItem = {
  id: string;
  name: string;
  type: string;
  parent?: string;
  layer?: string;
  network?: string;
  purpose?: string;
  runtime?: string;
  ip?: string;
  dns?: string;
  port?: string | number;
  url?: string;
  // Rich documentation fields
  documentation?: string;     // Markdown-formatted detailed documentation
  configuration?: string;      // Code/config snippets with commands
  notes?: string;             // Quick notes and troubleshooting tips
  tags?: string[];            // Categorization tags
  links?: Array<{             // Additional useful links
    label: string;
    url: string;
  }>;
  metadata?: {                // Administrative metadata
    lastUpdated?: string;
    owner?: string;
    version?: string;
  };
  icon?: string;             // Registry key, e.g. "SiDocker"
  iconColor?: string;        // Hex color override, e.g. "#2496ED"
};

export type InfraTreeNode = InfraItem & {
  children: InfraTreeNode[];
};

// Connection types for cross-connections between nodes
export type ConnectionType = "ssh" | "http" | "https" | "vpn" | "storage" | "database" | "custom";

export interface CrossConnection {
  from: string;                 // Source node ID
  to: string;                   // Target node ID
  type: ConnectionType;         // Connection protocol/purpose
  label?: string;               // Display label (optional)
  description?: string;         // Documentation (optional)
  bidirectional?: boolean;      // Default: false
  metadata?: {
    port?: number;
    protocol?: string;
    bandwidth?: string;
  };
}
