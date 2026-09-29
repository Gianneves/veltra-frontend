"use client";

import { api } from "./client";
import type { UserProfile } from "./types";

export async function getProfile(): Promise<UserProfile | null> {
  try {
    return await api.get<UserProfile>("/users/me");
  } catch {
    return null;
  }
}

export async function updateProfile(data: {
  birthDate?: string | null;
  healthConsent?: boolean;
}): Promise<UserProfile | null> {
  try {
    return await api.patch<UserProfile>("/users/me", data);
  } catch {
    return null;
  }
}
