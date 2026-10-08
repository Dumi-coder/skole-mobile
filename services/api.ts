import * as SecureStore from "expo-secure-store";
import { createSkoleApiClient } from "@skole/api-client";
import { authSessionResponseSchema } from "@skole/contracts";

export type AppRole = "admin" | "student" | "teacher";

export type AppSession = {
  role: AppRole | null;
  userId: string;
};

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/+$/, "");

export const hasApiConfig = Boolean(apiBaseUrl);
export const apiClient = createSkoleApiClient({ baseUrl: apiBaseUrl });

async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; error?: { message?: string } };
    return body.error?.message ?? body.message ?? "The API request failed.";
  } catch {
    return "The API request failed.";
  }
}

export async function getStoredSession(): Promise<AppSession | null> {
  const value = await SecureStore.getItemAsync("skole-session");
  if (!value) return null;

  try {
    return JSON.parse(value) as AppSession;
  } catch {
    return null;
  }
}

export async function setStoredSession(session: AppSession): Promise<void> {
  await SecureStore.setItemAsync("skole-session", JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync("skole-session");
}

export async function signInWithEmail(email: string, password: string): Promise<AppSession> {
  const response = await fetch(`${apiBaseUrl}/v1/auth/sign-in/email`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  const session = authSessionResponseSchema.parse(await response.json()).data;
  const nextSession: AppSession = {
    role: session.role,
    userId: session.userId,
  };

  await setStoredSession(nextSession);
  return nextSession;
}

export async function getCurrentSession(): Promise<AppSession | null> {
  const response = await fetch(`${apiBaseUrl}/v1/auth/session`, {
    method: "GET",
    credentials: "include",
    headers: {
      accept: "application/json",
    },
  });

  if (response.status === 401) {
    await clearStoredSession();
    return null;
  }

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  const session = authSessionResponseSchema.parse(await response.json()).data;
  const nextSession: AppSession = {
    role: session.role,
    userId: session.userId,
  };

  await setStoredSession(nextSession);
  return nextSession;
}
