"use client";

import { api } from "./client";
import { mockTrainingPlan } from "./mock";
import type { TrainingPattern, TrainingPlan, TrainingSession } from "./types";

const USE_MOCK = false;

export async function getTrainingPlan(): Promise<TrainingPlan | null> {
  if (USE_MOCK) return Promise.resolve(mockTrainingPlan);
  try {
    return await api.get<TrainingPlan>("/training-plans/current");
  } catch {
    return null;
  }
}

export async function getAllPlans(): Promise<TrainingPlan[]> {
  if (USE_MOCK) return Promise.resolve([mockTrainingPlan]);
  try {
    return await api.get<TrainingPlan[]>("/training-plans");
  } catch {
    return [];
  }
}

export async function getPlanByWeek(weekStart: string): Promise<TrainingPlan | null> {
  try {
    return await api.get<TrainingPlan>(`/training-plans/by-week?weekStart=${weekStart}`);
  } catch {
    return null;
  }
}

export async function getTrainingPattern(): Promise<TrainingPattern | null> {
  try {
    return await api.get<TrainingPattern>("/training-plans/pattern");
  } catch {
    return null;
  }
}

export async function regeneratePlan(): Promise<{
  regenerated: boolean;
  weeks?: number;
  reason?: string;
} | null> {
  try {
    return await api.post<{
      regenerated: boolean;
      weeks?: number;
      reason?: string;
    }>("/training-plans/regenerate");
  } catch {
    return null;
  }
}

export async function linkSessionActivity(
  planId: string,
  sessionId: string,
  activityId: string | null,
): Promise<TrainingSession | null> {
  try {
    return await api.put<TrainingSession>(
      `/training-plans/${planId}/sessions/${sessionId}/activity`,
      { activityId },
    );
  } catch {
    return null;
  }
}

export async function updateSession(
  planId: string,
  sessionId: string,
  data: Partial<
    Pick<
      TrainingSession,
      "plannedDistance" | "plannedPace" | "type" | "day" | "notes"
    >
  > & { acknowledgeAgePolicy?: boolean }
): Promise<ApplySessionResult> {
  try {
    await api.put<TrainingSession>(`/training-plans/${planId}/sessions/${sessionId}`, data);
    return { ok: true };
  } catch (err) {
    return sessionError(err, "Não foi possível aplicar a mudança. Tente novamente.");
  }
}

export interface BatchSessionItem {
  sessionId: string;
  type?: TrainingSession["type"];
  plannedDistance?: number;
  plannedPace?: number;
  day?: string;
  notes?: string;
}

export async function applySessionsBatch(
  planId: string,
  items: BatchSessionItem[],
): Promise<ApplySessionResult> {
  try {
    await api.put<TrainingSession[]>(
      `/training-plans/${planId}/sessions/batch`,
      { items },
    );
    return { ok: true };
  } catch (err) {
    return sessionError(
      err,
      "Não foi possível aplicar as mudanças em lote. Nada foi alterado.",
    );
  }
}

export interface ApplySessionResult {
  ok: boolean;
  status?: number;
  code?: string;
  message?: string;
}

function sessionError(err: unknown, fallback: string): ApplySessionResult {
  const record =
    typeof err === "object" && err !== null
      ? (err as Record<string, unknown>)
      : null;
  const status = Number(record?.status) || 0;
  const code = typeof record?.code === "string" ? record.code : undefined;
  const serverMessage =
    typeof record?.message === "string" && record.message.length > 0
      ? record.message
      : undefined;

  return {
    ok: false,
    status,
    code,
    message: serverMessage ?? errorMessage(status, fallback),
  };
}

function errorMessage(status: number, fallback: string): string {
  if (status === 400)
    return "Mudança recusada pelo servidor. Confira os valores e tente de novo.";
  if (status === 404)
    return "Treino não encontrado no plano. Recarregue a semana e peça de novo.";
  return fallback;
}

export async function applySessionChange(
  planId: string,
  sessionId: string,
  data: Partial<
    Pick<
      TrainingSession,
      "plannedDistance" | "plannedPace" | "type" | "day" | "notes"
    >
  >,
): Promise<ApplySessionResult> {
  try {
    await api.put<TrainingSession>(
      `/training-plans/${planId}/sessions/${sessionId}`,
      data,
    );
    return { ok: true };
  } catch (err) {
    return sessionError(
      err,
      "Não foi possível aplicar a mudança. Tente novamente.",
    );
  }
}
