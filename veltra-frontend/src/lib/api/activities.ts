"use client";

import { api } from "./client";
import { mockActivities } from "./mock";
import type { Activity } from "./types";

const USE_MOCK = false;

export async function getActivities(): Promise<Activity[]> {
  if (USE_MOCK) return Promise.resolve(mockActivities);
  return api.get<Activity[]>("/activities");
}

export async function getActivity(id: string): Promise<Activity | null> {
  if (USE_MOCK) return Promise.resolve(mockActivities.find((a) => a.id === id) ?? null);
  try {
    return await api.get<Activity>(`/activities/${id}`);
  } catch {
    return null;
  }
}
