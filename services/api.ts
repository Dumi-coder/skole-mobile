import { createSkoleApiClient } from "@skole/api-client";
import { authSessionResponseSchema } from "@skole/contracts";
import * as SecureStore from "expo-secure-store";

export type AppRole = "admin" | "student" | "teacher";

export type AppSession = {
  role: AppRole | null;
  userId: string;
};

const apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");
const googleAuthFallbackPaths = [
  "/v1/auth/sign-in/google",
  "/v1/auth/google",
  "/v1/auth/oauth/google",
  "/v1/auth/google/callback",
];

export const hasApiConfig = Boolean(apiBaseUrl);
export const apiClient = createSkoleApiClient({ baseUrl: apiBaseUrl });

async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: { message?: string };
    };
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

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AppSession> {
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

export async function signInWithGoogle(idToken: string): Promise<AppSession> {
  const trimmedToken = idToken.trim();
  if (!trimmedToken) {
    throw new Error("Google authentication did not return a valid token.");
  }

  let lastError: Error | null = null;

  for (const path of googleAuthFallbackPaths) {
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          idToken: trimmedToken,
          token: trimmedToken,
          provider: "google",
        }),
      });

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        const message = await readApiError(response);
        throw new Error(message);
      }

      const body = (await response.json()) as {
        data?: { role?: AppRole | null; userId?: string };
      };
      const sessionData = body?.data;

      if (!sessionData || !sessionData.userId) {
        throw new Error(
          "Google sign-in response was not in the expected format.",
        );
      }

      const nextSession: AppSession = {
        role: sessionData.role ?? null,
        userId: sessionData.userId,
      };

      await setStoredSession(nextSession);
      return nextSession;
    } catch (caughtError) {
      lastError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Google sign-in failed.");
    }
  }

  throw lastError ?? new Error("Google sign-in endpoint was unavailable.");
}
