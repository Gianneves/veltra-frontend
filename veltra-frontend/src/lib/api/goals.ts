"use client";

import { api } from "./client";
import { mockGoals } from "./mock";
import type { Goal } from "./types";

const USE_MOCK = false;

export async function getGoals(): Promise<Goal[]> {
  if (USE_MOCK) return Promise.resolve(mockGoals);
  return api.get<Goal[]>("/goals");
}

export async function createGoal(data: { title: string; targetDistance: number; targetDate: string; discipline: string }): Promise<Goal | null> {
  try {
    return await api.post<Goal>("/goals", data);
  } catch {
    return null;
  }
}

export async function updateGoal(id: string, data: Partial<Goal>): Promise<Goal | null> {
  try {
    return await api.put<Goal>(`/goals/${id}`, data);
  } catch {
    return null;
  }
}
