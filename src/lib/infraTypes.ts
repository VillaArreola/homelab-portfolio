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
};

export type InfraTreeNode = InfraItem & {
  children: InfraTreeNode[];
};
