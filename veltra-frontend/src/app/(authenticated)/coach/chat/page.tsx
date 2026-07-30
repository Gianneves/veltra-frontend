"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/api/coach";
import type { ChatMessage } from "@/lib/api/types";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoachChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "coach",
      content: "Olá! Sou seu coach de corrida com IA. Como posso ajudar hoje?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const reply = await sendMessage(text);
      setMessages((prev) => [...prev, { ...reply, id: `coach-${Date.now()}` }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "coach",
          content: "Desculpe, não consegui processar sua mensagem. Tente novamente.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Coach de Corrida" subtitle="Converse com sua inteligência artificial" />

      <div className="flex-1 space-y-4 mb-4 overflow-y-auto px-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "coach" && (
              <img
                src="/images/avatar-coach.svg"
                alt="Coach"
                className="h-8 w-8 shrink-0 rounded-full"
              />
            )}
            <div
              className={cn(
                "max-w-[70%] rounded-lg px-4 py-3",
                msg.role === "user"
                  ? "bg-primary text-on-primary rounded-br-sm"
                  : "bg-surface-container text-on-surface rounded-bl-sm"
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p
                className={cn(
                  "text-xs mt-1",
                  msg.role === "user" ? "text-on-primary/70" : "text-on-surface-variant"
                )}
              >
                {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {msg.role === "user" && (
              <img
                src="/images/logo-icon.svg"
                alt="User"
                className="h-8 w-8 shrink-0 rounded-full bg-surface-container-highest p-1"
              />
            )}
          </div>
        ))}
        {sending && (
          <div className="flex gap-3">
            <img
              src="/images/avatar-coach.svg"
              alt="Coach"
              className="h-8 w-8 shrink-0 rounded-full"
            />
            <div className="bg-surface-container text-on-surface rounded-lg rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.1s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-surface-container-high pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Pergunte algo sobre seus treinos..."
          className="flex-1 rounded-md border border-surface-container-highest bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={!input.trim() || sending} size="md">
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
