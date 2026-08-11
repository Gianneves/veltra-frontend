"use client";

import { api } from "./client";
import { mockActivities } from "./mock";
import type { Activity } from "./types";

const USE_MOCK = false;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function getActivities(): Promise<Activity[]> {
  if (USE_MOCK) return Promise.resolve(mockActivities);
  const res = await api.get<PaginatedResponse<Activity>>("/activities?limit=9999");
  return res.data;
}

export async function getActivitiesPaginated(
  page = 1,
  limit = 20,
  period?: string,
  year?: string,
): Promise<PaginatedResponse<Activity>> {
  if (USE_MOCK) {
    const filtered = period !== "all" && period
      ? mockActivities
      : mockActivities;
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  }
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (period && period !== "all") params.set("period", period);
  if (period === "year" && year) params.set("year", year);
  return api.get<PaginatedResponse<Activity>>(`/activities?${params}`);
}

export async function getActivityYears(): Promise<number[]> {
  if (USE_MOCK) return Promise.resolve([2026, 2025]);
  return api.get<number[]>("/activities/years");
}

export async function getActivity(id: string): Promise<Activity | null> {
  if (USE_MOCK) return Promise.resolve(mockActivities.find((a) => a.id === id) ?? null);
  try {
    return await api.get<Activity>(`/activities/${id}`);
  } catch {
    return null;
  }
}
