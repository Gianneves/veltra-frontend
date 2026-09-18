"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, MessageSquarePlus, Send, X } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  getConversationMessages,
  getConversations,
  streamCoachMessage,
} from "@/lib/api/coach";
import { updateSession } from "@/lib/api/training";
import { formatNumber, formatPace } from "@/lib/format";
import { typeLabels } from "@/lib/training-display";
import type {
  ChatMessage,
  CoachProposal,
  TrainingSessionType,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "coach",
  content:
    "Olá! Sou seu coach de corrida com IA. Posso analisar seus treinos, tirar dúvidas e negociar ajustes no seu plano. Como posso ajudar hoje?",
  timestamp: "",
};

type ProposalStatus = "applied" | "discarded" | "error";

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  h1: ({ children }) => (
    <p className="mb-2 font-sora font-semibold">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="mb-2 font-sora font-semibold">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="mb-2 font-sora font-semibold">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary underline"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-container-high px-1 py-0.5 text-xs">
      {children}
    </code>
  ),
};

function typeLabel(type: string): string {
  return typeLabels[type as TrainingSessionType] ?? type;
}

function formatDistanceKm(meters: number): string {
  return `${formatNumber(meters / 1000, 1)} km`;
}

function formatProposalPace(pace: number): string {
  return pace > 0 ? `${formatPace(pace)}/km` : "livre";
}

function ProposalCard({
  proposal,
  status,
  applying,
  onApply,
  onDiscard,
}: {
  proposal: CoachProposal;
  status?: ProposalStatus;
  applying: boolean;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const { before, changes } = proposal;

  const rows: { label: string; from?: string; to: string }[] = [];

  if (changes.day) {
    rows.push({ label: "Dia", from: before.day, to: changes.day });
  }
  if (changes.type) {
    rows.push({
      label: "Tipo",
      from: typeLabel(before.type),
      to: typeLabel(changes.type),
    });
  }
  if (changes.plannedDistance !== undefined) {
    rows.push({
      label: "Distância",
      from: formatDistanceKm(before.plannedDistance),
      to: formatDistanceKm(changes.plannedDistance),
    });
  }
  if (changes.plannedPace !== undefined) {
    rows.push({
      label: "Pace",
      from: formatProposalPace(before.plannedPace),
      to: formatProposalPace(changes.plannedPace),
    });
  }
  if (changes.notes) {
    rows.push({ label: "Observações", to: changes.notes });
  }

  if (status === "discarded") {
    return (
      <p className="mt-3 text-xs text-on-surface-variant">
        Proposta descartada.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Proposta de mudança
      </p>
      {proposal.reason && (
        <p className="mt-1 font-geist text-sm text-on-surface-variant">
          {proposal.reason}
        </p>
      )}

      <div className="mt-3 space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 font-geist text-sm"
          >
            <span className="text-on-surface-variant">{row.label}</span>
            <span className="text-right">
              {row.from && (
                <span className="mr-2 text-on-surface-variant line-through">
                  {row.from}
                </span>
              )}
              <span className="font-semibold text-on-surface">{row.to}</span>
            </span>
          </div>
        ))}
      </div>

      {status === "applied" ? (
        <p className="mt-3 flex items-center gap-1.5 font-geist text-sm font-semibold text-primary">
          <Check size={14} />
          Mudança aplicada ao seu plano
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={onApply} loading={applying}>
              Aplicar mudança
            </Button>
            <Button size="sm" variant="ghost" onClick={onDiscard}>
              <X size={14} />
              Descartar
            </Button>
          </div>
          {status === "error" && (
            <p className="mt-2 font-geist text-xs text-error">
              Não foi possível aplicar a mudança. Tente novamente.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function CoachChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [proposals, setProposals] = useState<Record<string, CoachProposal>>({});
  const [proposalStatus, setProposalStatus] = useState<
    Record<string, ProposalStatus>
  >({});
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const conversations = await getConversations();
        if (!active || conversations.length === 0) return;

        const latest = conversations[0];
        const history = await getConversationMessages(latest.id);
        if (!active) return;

        setConversationId(latest.id);
        if (history.length > 0) setMessages(history);
      } catch {
        // keep the welcome message
      } finally {
        if (active) setLoadingHistory(false);
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const placeholderId = `coach-${Date.now()}`;

    setMessages((current) => [
      ...current.filter((message) => message.id !== "welcome"),
      userMessage,
      {
        id: placeholderId,
        role: "coach",
        content: "",
        timestamp: "",
      },
    ]);
    setInput("");
    setSending(true);

    const updatePlaceholder = (update: (message: ChatMessage) => ChatMessage) =>
      setMessages((current) =>
        current.map((message) =>
          message.id === placeholderId ? update(message) : message,
        ),
      );

    const failPlaceholder = () =>
      updatePlaceholder(() => ({
        id: placeholderId,
        role: "coach",
        content:
          "Desculpe, não consegui processar sua mensagem. Tente novamente.",
        timestamp: new Date().toISOString(),
      }));

    try {
      await streamCoachMessage(text, conversationId, {
        onToken: (token) =>
          updatePlaceholder((message) => ({
            ...message,
            content: message.content + token,
          })),
        onDone: (result) => {
          setConversationId(result.conversationId);
          updatePlaceholder(() => result.message);
          if (result.proposal) {
            setProposals((current) => ({
              ...current,
              [result.message.id]: result.proposal as CoachProposal,
            }));
          }
        },
        onError: failPlaceholder,
      });
    } catch {
      failPlaceholder();
    } finally {
      setSending(false);
    }
  };

  const handleApply = async (messageId: string, proposal: CoachProposal) => {
    setApplyingId(messageId);

    const updated = await updateSession(
      proposal.planId,
      proposal.sessionId,
      proposal.changes,
    );

    setProposalStatus((current) => ({
      ...current,
      [messageId]: updated ? "applied" : "error",
    }));
    setApplyingId(null);
  };

  const handleDiscard = (messageId: string) => {
    setProposalStatus((current) => ({ ...current, [messageId]: "discarded" }));
  };

  const handleNewConversation = () => {
    setConversationId(undefined);
    setMessages([WELCOME]);
    setProposals({});
    setProposalStatus({});
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <Header
          title="Coach de Corrida"
          subtitle="Converse com sua inteligência artificial"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleNewConversation}
          disabled={sending}
          className="mt-1 shrink-0"
        >
          <MessageSquarePlus size={14} />
          Nova conversa
        </Button>
      </div>

      <div className="mb-4 flex-1 space-y-4 overflow-y-auto px-1">
        {loadingHistory && (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" && "flex-row-reverse",
            )}
          >
            <img
              src={
                message.role === "coach"
                  ? "/images/avatar-coach.svg"
                  : "/images/veltra-icon-light-bg.svg"
              }
              alt={message.role === "coach" ? "Coach" : "Você"}
              className={cn(
                "h-8 w-8 shrink-0 rounded-full",
                message.role === "user" &&
                  "bg-surface-container-highest p-1",
              )}
            />

            <div
              className={cn(
                "max-w-[70%] rounded-lg px-4 py-3",
                message.role === "user"
                  ? "rounded-br-sm bg-primary text-on-primary"
                  : "rounded-bl-sm bg-surface-container text-on-surface",
              )}
            >
              {message.role === "coach" && !message.content && sending ? (
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                </span>
              ) : message.role === "coach" ? (
                <div className="font-geist text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap font-geist text-sm leading-relaxed">
                  {message.content}
                </p>
              )}

              {proposals[message.id] && (
                <ProposalCard
                  proposal={proposals[message.id]}
                  status={proposalStatus[message.id]}
                  applying={applyingId === message.id}
                  onApply={() =>
                    handleApply(message.id, proposals[message.id])
                  }
                  onDiscard={() => handleDiscard(message.id)}
                />
              )}

              {message.timestamp && (
                <p
                  className={cn(
                    "mt-1.5 text-xs",
                    message.role === "user"
                      ? "text-on-primary/70"
                      : "text-on-surface-variant",
                  )}
                >
                  {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Pergunte sobre seus treinos..."
          disabled={sending}
          className="flex-1 rounded-md border border-surface-container-highest bg-surface-container-lowest px-4 py-2.5 font-geist text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <Button
          size="md"
          onClick={() => void handleSend()}
          disabled={!input.trim()}
          loading={sending}
        >
          <Send size={16} />
          Enviar
        </Button>
      </div>
    </div>
  );
}
