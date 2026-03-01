import { InfraItem } from "./infraTypes";

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
