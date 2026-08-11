"use client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

interface ApiError {
  status: number;
  message: string;
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function transformKeys<T>(obj: unknown): T {
  if (Array.isArray(obj)) return obj.map(transformKeys) as unknown as T;
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>).reduce(
      (acc, key) => {
        acc[toCamel(key)] = transformKeys((obj as Record<string, unknown>)[key]);
        return acc;
      },
      {} as Record<string, unknown>,
    ) as T;
  }
  return obj as T;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err: ApiError = { status: res.status, message: res.statusText };
    throw err;
  }

  const json = await res.json();
  return transformKeys<T>(json);
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>("GET", path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>("POST", path, body);
  },
  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>("PUT", path, body);
  },
  del<T>(path: string): Promise<T> {
    return request<T>("DELETE", path);
  },
};
