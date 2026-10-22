import { getCookie } from "@better-auth/expo/client";
import { createSkoleApiClient } from "@skole/api-client";
import * as SecureStore from "expo-secure-store";

import { authClient } from "@/lib/auth-client";

export type AppRole = "admin" | "student" | "teacher";

export type AppSession = {
  role: AppRole | null;
  userId: string;
};

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. " +
      "Create a .env file with EXPO_PUBLIC_API_URL=<your API URL>.",
  );
}

const baseUrl = apiBaseUrl.replace(/\/+$/, "");

/**
 * Retrieve the latest session cookie, checking authClient and falling back to SecureStore.
 */
async function resolveLatestCookie(): Promise<string> {
  const cookie = await authClient.getCookie();
  if (cookie) return cookie;
  try {
    const rawStored = await SecureStore.getItemAsync("skole_cookie");
    if (rawStored) {
      return getCookie(rawStored);
    }
  } catch {
    // SecureStore access failed or not initialized
  }
  return "";
}

/**
 * Fetch wrapper that attaches the better-auth session cookie.
 * Uses credentials: "omit" so the native fetch does not interfere
 * with cookie handling — the Cookie header is set explicitly.
 */
export async function authFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const cookie = await resolveLatestCookie();
  const headers = new Headers(init?.headers);
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const response = await fetch(input, {
    ...init,
    credentials: "omit",
    headers,
  });

  const requestUrl =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  // Only auto-signout on 401 if the request is not a session verification check
  if (response.status === 401 && !requestUrl.includes("/v1/auth/session")) {
    await authClient.signOut();
  }

  return response;
}

/**
 * Custom fetch implementation for @skole/api-client that injects
 * the session cookie from better-auth's expoClient storage.
 */
const authenticatedFetch: typeof globalThis.fetch = async (input, init) => {
  const cookie = await resolveLatestCookie();
  const headers = new Headers(init?.headers);
  if (cookie) {
    headers.set("Cookie", cookie);
  }
  // Override credentials to "omit" — we handle cookies manually.
  return fetch(input, { ...init, credentials: "omit", headers });
};

export const apiClient = createSkoleApiClient({
  baseUrl,
  fetch: authenticatedFetch,
});

export async function readApiError(response: Response): Promise<string> {
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
