import { NextResponse } from "next/server";
import { validateTopology, VALID_NODE_TYPES } from "@/lib/validateTopology";
import { InfraItem } from "@/lib/infraTypes";

// LLM Configuration - separate from chat, uses GENERATION_* env vars
const LLM_CONFIG = {
  apiUrl: process.env.LLM_GENERATION_API_URL || process.env.LLM_API_URL || "http://localhost:4000/v1/chat/completions",
  apiKey: process.env.LLM_GENERATION_API_KEY || process.env.LLM_API_KEY || "sk-mi-clave-windows",
  model: process.env.LLM_GENERATION_MODEL || process.env.LLM_MODEL || "qwen3-vl:Cloud",
  temperature: parseFloat(process.env.LLM_GENERATION_TEMPERATURE || process.env.LLM_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.LLM_GENERATION_MAX_TOKENS || process.env.LLM_MAX_TOKENS || "2000"),
};

// Rate limiting configuration (same as chat)
const RATE_LIMIT = {
  maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT_RPM || "10"),
  maxPromptLength: parseInt(process.env.MAX_MESSAGE_LENGTH || "2000"),
  requestTimeout: parseInt(process.env.LLM_GENERATION_TIMEOUT || process.env.REQUEST_TIMEOUT || "60000"), // 60 seconds for generation
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0] || realIp || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; resetIn?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean old records
  if (record && now > record.resetTime) {
    rateLimitMap.delete(ip);
  }

  // Create new record
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 60000, // 1 minute
    });
    return { allowed: true };
  }

  // Check limit
  const currentRecord = rateLimitMap.get(ip)!;
  if (currentRecord.count >= RATE_LIMIT.maxRequestsPerMinute) {
    const resetIn = Math.ceil((currentRecord.resetTime - now) / 1000);
    return { allowed: false, resetIn };
  }

  // Increment counter
  currentRecord.count++;
  return { allowed: true };
}

/**
 * Build system prompt with schema, examples, and conversational context
 */
function buildSystemPrompt(
  conversationHistory?: Array<{ role: string; content: string }>,
  currentTopology?: InfraItem[]
): string {
  // Extract context from conversation
  let contextSection = "";
  
  if (currentTopology && currentTopology.length > 0) {
    const nodeIds = currentTopology.map(n => n.id).join(", ");
    contextSection += `\n\n🏗️ **CURRENT STATE**\nExisting topology has ${currentTopology.length} nodes: ${nodeIds}\n`;
  }
  
  if (conversationHistory && conversationHistory.length > 0) {
    const lastUserMsg = conversationHistory.filter(m => m.role === "user").slice(-1)[0]?.content || "";
    const isModification = /\b(agrega|añade|add|modifica|modify|cambia|change|elimina|remove)\b/i.test(lastUserMsg);
    
    if (isModification && currentTopology) {
      contextSection += `\n⚠️ **USER WANTS TO MODIFY** existing topology. Generate COMPLETE new topology with changes applied.\n`;
    }
  }
  
  return `You are an infrastructure topology generator. Your ONLY task is to generate valid JSON arrays of infrastructure nodes.${contextSection}

📋 **OUTPUT FORMAT** (STRICT)
You MUST output ONLY a valid JSON array. NO markdown, NO explanations, NO code blocks.

Example output format:
[{"id":"laptop","name":"Main Laptop","type":"host","layer":"physical","purpose":"Primary workstation"},{"id":"proxmox","name":"Proxmox VE","type":"hypervisor","parent":"laptop","layer":"virtual","purpose":"Main hypervisor"}]

🔧 **InfraItem SCHEMA**
Each object in the array must follow this TypeScript interface:

{
  // REQUIRED FIELDS
  "id": string,              // Unique kebab-case identifier (e.g., "proxmox", "vm-ubuntu-1")
  "name": string,            // Display name (e.g., "Proxmox VE", "Ubuntu Server")
  "type": string,            // Must be one of: ${VALID_NODE_TYPES.join(", ")}
  
  // OPTIONAL FIELDS
  "parent": string,          // ID of parent node (creates hierarchy). DO NOT create cycles!
  "layer": string,           // "physical" | "virtual" | "cloud"
  "runtime": string,         // e.g., "docker", "vmware", "bare-metal"
  "network": string,         // CIDR or label (e.g., "10.10.10.0/24", "DMZ")
  "purpose": string,         // Brief description
  "ip": string,              // IP address
  "dns": string,             // DNS name
  "port": number,            // Port number
  "url": string,             // Management URL
  "notes": string,           // Additional notes
  "tags": string[]           // Array of tags
}

📚 **VALID EXAMPLES**

Example 1 - Simple Homelab:
[
  {"id":"laptop","name":"Main Laptop","type":"host","layer":"physical","purpose":"Primary workstation"},
  {"id":"docker-local","name":"Docker","type":"container-runtime","parent":"laptop","layer":"virtual","runtime":"docker"},
  {"id":"nginx","name":"Nginx Proxy","type":"service","parent":"docker-local","purpose":"Reverse proxy","port":80}
]

Example 2 - Cloud Infrastructure:
[
  {"id":"oci-cloud","name":"Oracle Cloud","type":"cloud-host","layer":"cloud"},
  {"id":"vm-ubuntu","name":"Ubuntu Server","type":"vm","parent":"oci-cloud","layer":"virtual","ip":"150.136.10.5"},
  {"id":"docker-oci","name":"Docker","type":"container-runtime","parent":"vm-ubuntu","runtime":"docker"},
  {"id":"portainer","name":"Portainer","type":"service","parent":"docker-oci","port":9000,"url":"https://portainer.example.com"}
]

Example 3 - Complex Homelab:
[
  {"id":"laptop","name":"Main Laptop","type":"host","layer":"physical"},
  {"id":"proxmox","name":"Proxmox VE","type":"hypervisor","parent":"laptop","layer":"virtual","ip":"10.10.10.53","port":8006},
  {"id":"pfsense","name":"pfSense","type":"firewall","parent":"proxmox","network":"10.10.10.1","purpose":"Firewall and router"},
  {"id":"vm-ubuntu-1","name":"Ubuntu Server 1","type":"vm","parent":"proxmox","ip":"10.10.10.100"},
  {"id":"docker-ubuntu","name":"Docker","type":"container-runtime","parent":"vm-ubuntu-1","runtime":"docker"},
  {"id":"nginx-proxy","name":"Nginx Proxy Manager","type":"service","parent":"docker-ubuntu","port":81},
  {"id":"postgres","name":"PostgreSQL","type":"database","parent":"docker-ubuntu","port":5432}
]

⚠️ **CRITICAL RULES**

1. **IDs MUST be unique** across all nodes
2. **IDs MUST be kebab-case** (lowercase, hyphens only, no spaces/underscores)
3. **parent field** MUST reference an existing node's id (or be omitted for root nodes)
4. **NO CYCLES**: A node cannot be its own ancestor
5. **type field** MUST be one of the valid types listed above
6. **Output ONLY the JSON array** - no markdown, no explanations, no code fences

🤖 **YOUR TASK**

When given a user prompt:
- If it's **Mermaid code** (starts with \`flowchart\` or \`graph\`): Parse it into InfraItem array
- If it's **natural language**: Create an appropriate topology based on the description

Always generate VALID, HIERARCHICAL topologies with proper parent-child relationships.

**OUTPUT ONLY THE JSON ARRAY. NOTHING ELSE.**`;
}

export async function POST(request: Request) {
  try {
    // 🛡️ Rate Limiting
    const ip = getRateLimitKey(request);
    const rateLimitCheck = checkRateLimit(ip);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Try again in ${rateLimitCheck.resetIn} seconds.`,
          retryAfter: rateLimitCheck.resetIn,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitCheck.resetIn?.toString() || "60",
          },
        }
      );
    }

    const body = await request.json();
    const { prompt, conversationHistory, currentTopology } = body;

    // Validation
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Invalid prompt", message: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (prompt.length > RATE_LIMIT.maxPromptLength) {
      return NextResponse.json(
        {
          error: "Prompt too long",
          message: `Maximum prompt length is ${RATE_LIMIT.maxPromptLength} characters`,
        },
        { status: 400 }
      );
    }

    // Call LLM
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RATE_LIMIT.requestTimeout);

    try {
      const llmResponse = await fetch(LLM_CONFIG.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LLM_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: LLM_CONFIG.model,
          messages: [
            { role: "system", content: buildSystemPrompt(conversationHistory, currentTopology) },
            ...(conversationHistory || []),
            { role: "user", content: prompt },
          ],
          temperature: LLM_CONFIG.temperature,
          max_tokens: LLM_CONFIG.maxTokens,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!llmResponse.ok) {
        const errorText = await llmResponse.text();
        console.error("LLM API error:", llmResponse.status, errorText);
        console.error("LLM Config:", { 
          apiUrl: LLM_CONFIG.apiUrl, 
          model: LLM_CONFIG.model,
          maxTokens: LLM_CONFIG.maxTokens 
        });
        
        // Parse error details if available
        let errorDetails = llmResponse.statusText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.error?.message || errorJson.message || llmResponse.statusText;
        } catch {
          errorDetails = errorText || llmResponse.statusText;
        }

        return NextResponse.json(
          {
            error: "LLM API error",
            message: `Failed to generate topology (${llmResponse.status}): ${errorDetails}`,
            details: errorText,
          },
          { status: 502 }
        );
      }

      const llmData = await llmResponse.json();
      const generatedText = llmData.choices?.[0]?.message?.content?.trim();

      if (!generatedText) {
        return NextResponse.json(
          { error: "Empty response", message: "LLM returned empty response" },
          { status: 500 }
        );
      }

      // Parse JSON (handle potential markdown code blocks)
      let items: any;
      try {
        // Remove markdown code blocks if present
        let cleanedText = generatedText;
        if (generatedText.includes("```")) {
          cleanedText = generatedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }
        items = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "\nGenerated text:", generatedText);
        return NextResponse.json(
          {
            error: "Invalid JSON response",
            message: "LLM did not return valid JSON. Please try again or rephrase your prompt.",
          },
          { status: 500 }
        );
      }

      // Validate topology
      const validation = validateTopology(items);
      if (!validation.valid) {
        console.error("Validation errors:", validation.errors);
        return NextResponse.json(
          {
            error: "Invalid topology",
            message: "Generated topology has validation errors",
            details: validation.errors,
          },
          { status: 422 }
        );
      }

      // Success!
      return NextResponse.json({
        items: items as InfraItem[],
        count: items.length,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            error: "Request timeout",
            message: `Generation took longer than ${RATE_LIMIT.requestTimeout / 1000} seconds`,
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
