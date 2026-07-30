"use client";

import { api } from "./client";
import { mockUser } from "./mock";
import type { User } from "./types";

export async function getAuthUser(): Promise<User | null> {
  try {
    return await api.get<User>("/auth/me");
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export function getStravaConnectUrl(): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/auth/strava/connect`;
}

export function getMockUser(): User {
  return mockUser;
}
