"use client";

import { api } from "./client";
import { mockAchievements } from "./mock";
import type { Achievement } from "./types";

const USE_MOCK = false;

export async function getAchievements(): Promise<Achievement[]> {
  if (USE_MOCK) return Promise.resolve(mockAchievements);
  return api.get<Achievement[]>("/achievements");
}
