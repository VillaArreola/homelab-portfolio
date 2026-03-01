import { InfraItem, CrossConnection, ConnectionType } from "./infraTypes";

/**
 * Valid node types from node templates in Toolbar
 */
export const VALID_NODE_TYPES = [
  "host",
  "cloud-host",
  "hypervisor",
  "vm",
  "container-runtime",
  "service",
  "database",
  "firewall",
  "storage",
  "terminal",
  "vpn",
  "router",
  "subnet",
] as const;

/**
 * Valid layer values
 */
export const VALID_LAYERS = ["physical", "virtual", "cloud"] as const;

/**
 * Validates a single InfraItem object
 */
export function validateInfraItem(item: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!item.id || typeof item.id !== "string" || !item.id.trim()) {
    errors.push(`Missing or invalid 'id' field`);
  } else if (!/^[a-z0-9-]+$/.test(item.id)) {
    errors.push(`ID '${item.id}' must be kebab-case (lowercase letters, numbers, hyphens only)`);
  }

  if (!item.name || typeof item.name !== "string" || !item.name.trim()) {
    errors.push(`Node '${item.id}': Missing or invalid 'name' field`);
  }

  if (!item.type || typeof item.type !== "string" || !item.type.trim()) {
    errors.push(`Node '${item.id}': Missing or invalid 'type' field`);
  } else if (!VALID_NODE_TYPES.includes(item.type as any)) {
    errors.push(
      `Node '${item.id}': Invalid type '${item.type}'. Must be one of: ${VALID_NODE_TYPES.join(", ")}`
    );
  }

  // Optional parent validation (we'll check references later)
  if (item.parent !== undefined && typeof item.parent !== "string") {
    errors.push(`Node '${item.id}': 'parent' must be a string ID`);
  }

  // Optional layer validation
  if (item.layer && !VALID_LAYERS.includes(item.layer as any)) {
    errors.push(
      `Node '${item.id}': Invalid layer '${item.layer}'. Must be one of: ${VALID_LAYERS.join(", ")}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detects cycles in parent-child relationships
 * Based on mermaidImport.ts cycle detection logic
 */
function detectCycles(items: InfraItem[]): string[] {
  const cycles: string[] = [];
  const nodeMap = new Map<string, InfraItem>();

  // Build map
  items.forEach((item) => nodeMap.set(item.id, item));

  // Check each node for cycles
  items.forEach((item) => {
    if (!item.parent) return;

    const visited = new Set<string>();
    let current: string | undefined = item.id;

    while (current) {
      if (visited.has(current)) {
        cycles.push(`Cycle detected: ${Array.from(visited).join(" → ")} → ${current}`);
        break;
      }
      visited.add(current);

      const node = nodeMap.get(current);
      if (!node || !node.parent) break;

      current = node.parent;

      // Check if parent exists
      if (!nodeMap.has(current)) {
        cycles.push(`Node '${item.id}' references non-existent parent '${current}'`);
        break;
      }

      // Detect cycle
      if (current === item.id) {
        cycles.push(`Node '${item.id}' is its own ancestor (cycle)`);
        break;
      }
    }
  });

  return cycles;
}

/**
 * Validates an entire topology (array of InfraItem)
 */
export function validateTopology(items: any[]): {
  valid: boolean;
  errors: string[];
  cycles?: string[];
} {
  const errors: string[] = [];

  // Check if array
  if (!Array.isArray(items)) {
    return {
      valid: false,
      errors: ["Input must be an array of InfraItem objects"],
    };
  }

  if (items.length === 0) {
    return {
      valid: false,
      errors: ["Topology cannot be empty"],
    };
  }

  // Validate each item
  items.forEach((item, index) => {
    const result = validateInfraItem(item);
    if (!result.valid) {
      errors.push(`Item ${index}: ${result.errors.join(", ")}`);
    }
  });

  // Check for duplicate IDs
  const ids = items.map((item) => item.id).filter(Boolean);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate IDs found: ${[...new Set(duplicates)].join(", ")}`);
  }

  // If basic validation passed, check for cycles
  let cycles: string[] = [];
  if (errors.length === 0) {
    cycles = detectCycles(items as InfraItem[]);
    if (cycles.length > 0) {
      errors.push(...cycles);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    cycles: cycles.length > 0 ? cycles : undefined,
  };
}

/**
 * Valid connection types
 */
export const VALID_CONNECTION_TYPES: ConnectionType[] = [
  "ssh",
  "http",
  "https",
  "vpn",
  "storage",
  "database",
  "custom",
];

/**
 * Validates a single CrossConnection object
 */
export function validateConnection(
  connection: any,
  topology: InfraItem[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeIds = new Set(topology.map((item) => item.id));

  // Required fields
  if (!connection.from || typeof connection.from !== "string" || !connection.from.trim()) {
    errors.push(`Missing or invalid 'from' field`);
  } else if (!nodeIds.has(connection.from)) {
    errors.push(`Connection references non-existent source node '${connection.from}'`);
  }

  if (!connection.to || typeof connection.to !== "string" || !connection.to.trim()) {
    errors.push(`Missing or invalid 'to' field`);
  } else if (!nodeIds.has(connection.to)) {
    errors.push(`Connection references non-existent target node '${connection.to}'`);
  }

  if (!connection.type || typeof connection.type !== "string" || !connection.type.trim()) {
    errors.push(`Missing or invalid 'type' field`);
  } else if (!VALID_CONNECTION_TYPES.includes(connection.type as ConnectionType)) {
    errors.push(
      `Invalid connection type '${connection.type}'. Must be one of: ${VALID_CONNECTION_TYPES.join(", ")}`
    );
  }

  // Check for self-loops
  if (connection.from === connection.to) {
    errors.push(`Self-loop detected: connection from '${connection.from}' to itself`);
  }

  // Optional field type validation
  if (connection.label !== undefined && typeof connection.label !== "string") {
    errors.push(`'label' must be a string`);
  }

  if (connection.description !== undefined && typeof connection.description !== "string") {
    errors.push(`'description' must be a string`);
  }

  if (connection.bidirectional !== undefined && typeof connection.bidirectional !== "boolean") {
    errors.push(`'bidirectional' must be a boolean`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an entire connections array
 */
export function validateConnections(
  connections: any[],
  topology: InfraItem[]
): { valid: boolean; errors: string[]; duplicates?: string[] } {
  const errors: string[] = [];

  // Check if array
  if (!Array.isArray(connections)) {
    return {
      valid: false,
      errors: ["Connections must be an array"],
    };
  }

  // Empty array is valid
  if (connections.length === 0) {
    return { valid: true, errors: [] };
  }

  // Validate each connection
  connections.forEach((connection, index) => {
    const result = validateConnection(connection, topology);
    if (!result.valid) {
      errors.push(`Connection ${index}: ${result.errors.join(", ")}`);
    }
  });

  // Check for duplicate connections (same from-to pair)
  const connectionKeys = connections
    .filter((c) => c.from && c.to)
    .map((c) => `${c.from}->${c.to}`);
  const duplicates = connectionKeys.filter((key, index) => connectionKeys.indexOf(key) !== index);

  if (duplicates.length > 0) {
    const uniqueDuplicates = [...new Set(duplicates)];
    errors.push(`Duplicate connections found: ${uniqueDuplicates.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    duplicates: duplicates.length > 0 ? [...new Set(duplicates)] : undefined,
  };
}

