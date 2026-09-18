"use client";

import { api } from "./client";
import type { AchievementsResponse } from "./types";

export async function getAchievements(): Promise<AchievementsResponse> {
  return api.get<AchievementsResponse>("/achievements");
}
