"use client";

import { api } from "./client";
import { mockTrainingPlan } from "./mock";
import type { TrainingPlan } from "./types";

const USE_MOCK = false;

export async function getTrainingPlan(): Promise<TrainingPlan | null> {
  if (USE_MOCK) return Promise.resolve(mockTrainingPlan);
  try {
    return await api.get<TrainingPlan>("/training-plans/current");
  } catch {
    return null;
  }
}
