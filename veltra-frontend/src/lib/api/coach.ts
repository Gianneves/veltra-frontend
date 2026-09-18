"use client";

import { api } from "./client";
import type {
  ChatMessage,
  CoachConversation,
  CoachProposal,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

interface RawMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string | null;
}

export async function getConversations(): Promise<CoachConversation[]> {
  return api.get<CoachConversation[]>("/coach/chat");
}

export async function getConversationMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const messages = await api.get<RawMessage[]>(
    `/coach/chat?conversationId=${conversationId}`,
  );

  return messages.map((message) => ({
    id: message.id,
    role: message.role === "user" ? "user" : "coach",
    content: message.content,
    timestamp: message.createdAt ?? "",
  }));
}

export interface CoachStreamResult {
  conversationId: string;
  message: ChatMessage;
  proposal: CoachProposal | null;
}

interface StreamHandlers {
  onToken: (token: string) => void;
  onDone: (result: CoachStreamResult) => void;
  onError: () => void;
}

function handleFrame(frame: string, handlers: StreamHandlers) {
  const lines = frame.split("\n");
  const event = lines
    .find((line) => line.startsWith("event: "))
    ?.slice(7)
    .trim();
  const data = lines
    .find((line) => line.startsWith("data: "))
    ?.slice(6);

  if (!event || !data) return;

  try {
    const parsed = JSON.parse(data) as {
      token?: string;
      conversationId?: string;
      message?: {
        id: string;
        content: string;
        timestamp?: string;
      };
      proposal?: CoachProposal | null;
    };

    if (event === "token" && parsed.token) {
      handlers.onToken(parsed.token);
      return;
    }

    if (event === "done" && parsed.conversationId && parsed.message) {
      handlers.onDone({
        conversationId: parsed.conversationId,
        message: {
          id: parsed.message.id,
          role: "coach",
          content: parsed.message.content,
          timestamp: parsed.message.timestamp ?? "",
        },
        proposal: parsed.proposal ?? null,
      });
      return;
    }

    if (event === "error") {
      handlers.onError();
    }
  } catch {
    // ignore malformed frames
  }
}

export async function streamCoachMessage(
  content: string,
  conversationId: string | undefined,
  handlers: StreamHandlers,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/coach/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content, conversationId }),
  });

  if (!response.ok || !response.body) {
    handlers.onError();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      handleFrame(frame, handlers);
      boundary = buffer.indexOf("\n\n");
    }
  }
}
