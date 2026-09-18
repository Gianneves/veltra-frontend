"use client";

import { api } from "./client";
import type { ActivityInsight, InsightFeedItem } from "./types";

export async function getActivityInsight(
  activityId: string,
): Promise<ActivityInsight | null> {
  return api.get<ActivityInsight | null>(`/activities/${activityId}/insight`);
}

export async function generateActivityInsight(
  activityId: string,
): Promise<ActivityInsight> {
  return api.post<ActivityInsight>(`/activities/${activityId}/insight`);
}

export async function getInsightsFeed(limit = 20): Promise<InsightFeedItem[]> {
  return api.get<InsightFeedItem[]>(`/insights?limit=${limit}`);
}
