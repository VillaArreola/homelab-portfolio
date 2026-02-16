import { NextResponse } from "next/server";

// Configuración del LLM desde variables de entorno
const LLM_CONFIG = {
  apiUrl: process.env.LLM_API_URL || "http://localhost:4000/v1/chat/completions",
  apiKey: process.env.LLM_API_KEY || "sk-mi-clave-windows",
  model: process.env.LLM_MODEL || "qwen3-vl:Cloud",
  temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "500"),
};

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT_RPM || "10"), // 10 requests por minuto por IP
  maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || "2000"), // 2000 caracteres por mensaje
  maxMessagesInConversation: parseInt(process.env.MAX_CONVERSATION_LENGTH || "20"), // 20 mensajes máximo
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "30000"), // 30 segundos timeout
};

// Simple in-memory rate limiter (para producción considerar Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: Request): string {
  // Obtener IP del request
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0] || realIp || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; resetIn?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Limpiar registros antiguos (más de 1 minuto)
  if (record && now > record.resetTime) {
    rateLimitMap.delete(ip);
  }

  // Si no existe registro, crear uno nuevo
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 60000, // 1 minuto
    });
    return { allowed: true };
  }

  // Verificar si superó el límite
  const currentRecord = rateLimitMap.get(ip)!;
  if (currentRecord.count >= RATE_LIMIT.maxRequestsPerMinute) {
    const resetIn = Math.ceil((currentRecord.resetTime - now) / 1000);
    return { allowed: false, resetIn };
  }

  // Incrementar contador
  currentRecord.count++;
  return { allowed: true };
}

export async function POST(request: Request) {
  try {
    // 🛡️ PROTECCIÓN 1: Rate Limiting por IP
    const ip = getRateLimitKey(request);
    const rateLimitCheck = checkRateLimit(ip);
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: "Too many requests", 
          message: `Rate limit exceeded. Try again in ${rateLimitCheck.resetIn} seconds.`,
          retryAfter: rateLimitCheck.resetIn 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitCheck.resetIn?.toString() || "60"
          }
        }
      );
    }

    const { messages } = await request.json();

    // Validación básica
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // 🛡️ PROTECCIÓN 2: Límite de mensajes en conversación
    if (messages.length > RATE_LIMIT.maxMessagesInConversation) {
      return NextResponse.json(
        { 
          error: "Conversation too long",
          message: `Maximum ${RATE_LIMIT.maxMessagesInConversation} messages allowed in conversation.`
        },
        { status: 400 }
      );
    }

    // Validar que el último mensaje sea del usuario
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // 🛡️ PROTECCIÓN 3: Validar longitud de cada mensaje
    for (const msg of messages) {
      if (msg.content && msg.content.length > RATE_LIMIT.maxMessageLength) {
        return NextResponse.json(
          { 
            error: "Message too long",
            message: `Maximum ${RATE_LIMIT.maxMessageLength} characters per message.`
          },
          { status: 400 }
        );
      }
    }

    // 🛡️ PROTECCIÓN 4: Timeout en request al LLM
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RATE_LIMIT.requestTimeout);

    try {
      // Hacer la petición al LLM backend
      const response = await fetch(LLM_CONFIG.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LLM_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: LLM_CONFIG.model,
          messages: messages,
          temperature: LLM_CONFIG.temperature,
          max_tokens: LLM_CONFIG.maxTokens,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("LLM API Error:", response.status, errorText);
        return NextResponse.json(
          { error: `LLM API error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Validar que la respuesta tenga el formato esperado
      if (!data.choices || !data.choices[0]?.message?.content) {
        console.error("Invalid LLM response format:", data);
        return NextResponse.json(
          { error: "Invalid response format from LLM" },
          { status: 500 }
        );
      }

      // Retornar la respuesta en el formato esperado por el frontend
      return NextResponse.json(data);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { 
            error: "Request timeout",
            message: "The request took too long to complete. Please try again."
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
