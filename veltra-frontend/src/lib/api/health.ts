"use client";

import { api } from "./client";
import type { HealthOverview, HealthPolicy } from "./types";

export async function getHealthOverview(): Promise<HealthOverview | null> {
  try {
    return await api.get<HealthOverview>("/health/alerts");
  } catch {
    return null;
  }
}

export async function getHealthPolicy(
  distanceKm?: number,
): Promise<HealthPolicy | null> {
  try {
    const query =
      distanceKm !== undefined && Number.isFinite(distanceKm)
        ? `?distanceKm=${distanceKm}`
        : "";
    return await api.get<HealthPolicy>(`/health/policy${query}`);
  } catch {
    return null;
  }
}
