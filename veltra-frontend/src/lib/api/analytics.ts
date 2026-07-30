"use client";

import { api } from "./client";
import { mockActivities } from "./mock";
import type { Activity, WeeklyStats } from "./types";

const USE_MOCK = false;

export async function getWeeklyStats(): Promise<WeeklyStats | null> {
  if (USE_MOCK) {
    return {
      weekStart: "2026-06-22",
      totalDistance: 55_000,
      totalTime: 15750,
      runCount: 6,
    };
  }
  try {
    return await api.get<WeeklyStats>("/analytics/weekly");
  } catch {
    return null;
  }
}

export async function getAllActivities(): Promise<Activity[]> {
  if (USE_MOCK) return Promise.resolve(mockActivities);
  try {
    return await api.get<Activity[]>("/activities");
  } catch {
    return [];
  }
}
