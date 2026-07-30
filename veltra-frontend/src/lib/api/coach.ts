"use client";

import { api } from "./client";
import { mockInsights, mockChatMessages } from "./mock";
import type { CoachInsight, ChatMessage } from "./types";

const USE_MOCK = false;

export async function getInsights(): Promise<CoachInsight[]> {
  if (USE_MOCK) return Promise.resolve(mockInsights);
  return api.get<CoachInsight[]>("/coach/insights");
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  if (USE_MOCK) return Promise.resolve(mockChatMessages);
  return api.get<ChatMessage[]>("/coach/chat");
}

export async function sendMessage(content: string): Promise<ChatMessage> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      id: `msg-${Date.now()}`,
      role: "coach",
      content: `Ótima pergunta! Baseado nos seus dados de treino, sugiro focar em ${content.length > 20 ? "consistência de ritmo" : "recuperação ativa"} esta semana. Continue monitorando sua evolução!`,
      timestamp: new Date().toISOString(),
    };
  }
  return api.post<ChatMessage>("/coach/chat", { content });
}
