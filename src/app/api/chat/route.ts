import { NextResponse } from "next/server";

// Configuración del LLM desde variables de entorno
const LLM_CONFIG = {
  apiUrl: process.env.LLM_API_URL || "http://localhost:4000/v1/chat/completions",
  apiKey: process.env.LLM_API_KEY || "sk-mi-clave-windows",
  model: process.env.LLM_MODEL || "qwen3-vl:Cloud",
  temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "500"),
};

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Validación básica
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages format" },
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
    });

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

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
