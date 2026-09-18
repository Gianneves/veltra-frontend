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
  data: Partial<Pick<TrainingSession, "plannedDistance" | "plannedPace" | "type" | "notes">>
): Promise<TrainingSession | null> {
  try {
    return await api.put<TrainingSession>(`/training-plans/${planId}/sessions/${sessionId}`, data);
  } catch {
    return null;
  }
}
