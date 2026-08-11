"use client";

import { api } from "./client";
import { mockGoals } from "./mock";
import type { Goal } from "./types";

const USE_MOCK = false;

export async function getGoals(): Promise<Goal[]> {
  if (USE_MOCK) return Promise.resolve(mockGoals);
  return api.get<Goal[]>("/goals");
}

export async function createGoal(data: {
  title: string;
  targetDistance: number;
  targetDate: string;
  discipline: string;
  threeKmTime: number;
  longestRunDistance?: number;
  longestRunTime?: number;
  runDays?: string[];
  longRunDay?: string;
  daysPerWeek?: number;
}): Promise<Goal | null> {
  try {
    return await api.post<Goal>("/goals", data);
  } catch (err) {
    console.error("createGoal error:", err);
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

export async function deleteGoal(id: string): Promise<boolean> {
  try {
    await api.del<Goal>(`/goals/${id}`);
    return true;
  } catch (err) {
    console.error("deleteGoal error:", err);
    return false;
  }
}
