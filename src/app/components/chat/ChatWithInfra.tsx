"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatWithInfraProps {
  infrastructureData: any;
}

export default function ChatWithInfra({ infrastructureData }: ChatWithInfraProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: getTimestamp(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Preparar el contexto de la infraestructura
      const infraContext = JSON.stringify(infrastructureData, null, 2);
      
      const response = await fetch("http://localhost:4000/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer sk-mi-clave-windows`,
        },
        body: JSON.stringify({
          model: "qwen3-vl:Cloud",
          messages: [
            {
              role: "system",
              content: `You are an expert infrastructure assistant. You have access to the following infrastructure topology data:

${infraContext}

Answer questions about this infrastructure clearly and concisely. Include relevant details like IPs, VLANs, services, and relationships between components.`,
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: "user",
              content: input,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0]?.message?.content || "No response received.",
        timestamp: getTimestamp(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="w-[380px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl flex flex-col">
      {/* Header con toggle */}
      <div 
        className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 rounded-t-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 cursor-pointer"
        onClick={toggleCollapse}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse"></div>
            <Bot className="text-blue-400 relative z-10" size={16} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200">Asistente IA</h2>
            <p className="text-[9px] text-slate-500">Infraestructura</p>
          </div>
        </div>
        <button
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          title={isCollapsed ? "Expandir" : "Colapsar"}
          aria-label={isCollapsed ? "Expandir" : "Colapsar"}
        >
          {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Content - solo visible cuando no está colapsado */}
      {!isCollapsed && (
        <>
          {/* Messages Container */}
          <div className="h-[400px] overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                  <Bot className="text-blue-400 relative z-10" size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-200">¡Hola! 👋</h3>
                  <p className="text-xs text-slate-400 leading-relaxed px-4">
                    Pregúntame sobre la infraestructura
                  </p>
                </div>
                <div className="w-full space-y-1 pt-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Ejemplos:
                  </p>
                  {[
                    "¿Qué VLANs están configuradas?",
                    "Lista todos los servicios",
                    "¿Cuál es la IP de Proxmox?",
                  ].map((example, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] text-slate-500 bg-slate-800/50 rounded px-2 py-1 border border-slate-700/30"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-1.5 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mt-0.5">
                        <Bot className="text-blue-400" size={12} />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg p-2 ${
                        msg.role === "user"
                          ? "bg-blue-600/20 border border-blue-500/30"
                          : "bg-slate-800/60 border border-slate-700/50"
                      }`}
                    >
                      <p className="text-xs text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                      <span className="text-[8px] text-slate-500 mt-0.5 block">
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mt-0.5">
                        <User className="text-emerald-400" size={12} />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-1.5 justify-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <Bot className="text-blue-400" size={12} />
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
                      <Loader2 className="animate-spin text-blue-400" size={14} />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={14} />
                    <p className="text-[10px] text-red-300">{error}</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-2.5 border-t border-slate-700/50 bg-slate-900/50 rounded-b-2xl">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregunta algo..."
                disabled={isLoading}
                className="
                  flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2.5 py-1.5
                  text-xs text-slate-200 placeholder-slate-500
                  focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all
                "
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="
                  px-2.5 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30
                  text-blue-400 hover:bg-blue-600/30 hover:border-blue-500/50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all flex-shrink-0
                "
                title="Enviar"
                aria-label="Enviar mensaje"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
