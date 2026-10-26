import { getCookie } from "@better-auth/expo/client";
import { createSkoleApiClient } from "@skole/api-client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { authClient } from "@/lib/auth-client";

export type AppRole = "admin" | "student" | "teacher";

export type AppSession = {
  role: AppRole | null;
  userId: string;
  token?: string | null;
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

type ProfileResponse = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
};

type FeaturedResponse = {
  classes: Array<{
    id: string;
    name: string;
    teacherName: string;
    subject: string | null;
    grade: string | null;
  }>;
};

// -------------------------------------------------------------
// Chat & Messaging Types (Aligned with Fastify backend & Web app)
// -------------------------------------------------------------

export type ConversationType = "direct" | "class";

export type ApiMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  senderAvatarUrl?: string | null;
  content: string;
  createdAt: string;
  replyToId?: string | null;
  deletedAt?: string | null;
  outgoing?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    body: string;
  } | null;
};

export type ApiConversation = {
  id: string;
  type: ConversationType;
  name: string | null;
  teacherId: string;
  studentId?: string | null;
  teacherName?: string | null;
  studentName?: string | null;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  createdAt: string;
  unreadCount?: number;
  avatarUrl?: string | null;
  memberCount?: number | null;
  timeLabel?: string;
};

// Seed/Fallback Conversations for testing, demo, or offline local network mode
const initialFallbackConversations: ApiConversation[] = [
  {
    id: "conv-featured",
    type: "direct",
    name: "Mr. Dumi Perera (Combined Maths)",
    teacherId: "u-t1",
    teacherName: "Dumi Perera",
    studentId: "current-user",
    studentName: "Student",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    lastMessagePreview: "Yes, the 2024 Past Paper discussion is scheduled for Friday 5 PM.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    unreadCount: 1,
    memberCount: null,
    timeLabel: "2m",
  },
  {
    id: "conv-1",
    type: "class",
    name: "2026 A/L Combined Maths Sprint",
    teacherId: "u-t1",
    teacherName: "Dumi Perera",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    lastMessagePreview: "Tomorrow's calculus worksheet has been uploaded to the papers tab.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    unreadCount: 2,
    memberCount: 24,
    timeLabel: "15m",
  },
  {
    id: "conv-2",
    type: "direct",
    name: "Nimal Fernando (Physics)",
    teacherId: "u-t2",
    teacherName: "Nimal Fernando",
    studentId: "current-user",
    studentName: "Student",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lastMessagePreview: "Great question on electric fields. Review formula E = V/d.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    unreadCount: 0,
    memberCount: null,
    timeLabel: "45m",
  },
  {
    id: "conv-3",
    type: "direct",
    name: "Sajini Weerasinghe (Biology)",
    teacherId: "u-t3",
    teacherName: "Sajini Weerasinghe",
    studentId: "current-user",
    studentName: "Student",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    lastMessagePreview: "Please verify your attendance for Saturday's revision session.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    unreadCount: 0,
    memberCount: null,
    timeLabel: "3h",
  },
  {
    id: "conv-4",
    type: "class",
    name: "Grade 11 ICT Model Discussion",
    teacherId: "u-t1",
    teacherName: "Dumi Perera",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    lastMessagePreview: "Who has tried solving the database normalization question?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    unreadCount: 0,
    memberCount: 18,
    timeLabel: "1d",
  },
];

const initialFallbackMessages: Record<string, ApiMessage[]> = {
  "conv-featured": [
    {
      id: "mf-1",
      conversationId: "conv-featured",
      senderId: "u-t1",
      senderName: "Dumi Perera",
      content: "Hello! Welcome to sKole Maths mentoring. How is your revision on calculus and trigonometry going?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      outgoing: false,
    },
    {
      id: "mf-2",
      conversationId: "conv-featured",
      senderId: "current-user",
      senderName: "You",
      content: "Hello Sir! I solved the 2023 paper, but had difficulty with Question 4 on trigonometric substitution.",
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      outgoing: true,
    },
    {
      id: "mf-3",
      conversationId: "conv-featured",
      senderId: "u-t1",
      senderName: "Dumi Perera",
      content: "Good attempt! For Q4, use the substitution x = a sin(θ) so the term √(a² - x²) simplifies cleanly to a cos(θ).",
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      replyToId: "mf-2",
      replyTo: {
        id: "mf-2",
        senderName: "You",
        body: "Hello Sir! I solved the 2023 paper, but had difficulty with Question 4 on trigonometric substitution.",
      },
      outgoing: false,
    },
    {
      id: "mf-4",
      conversationId: "conv-featured",
      senderId: "current-user",
      senderName: "You",
      content: "Thank you Sir! That made it much simpler. Will there be a live review session for the remaining past paper questions?",
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      outgoing: true,
    },
    {
      id: "mf-5",
      conversationId: "conv-featured",
      senderId: "u-t1",
      senderName: "Dumi Perera",
      content: "Yes, the 2024 Past Paper discussion is scheduled for Friday 5 PM.",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      replyToId: "mf-4",
      replyTo: {
        id: "mf-4",
        senderName: "You",
        body: "Thank you Sir! That made it much simpler. Will there be a live review session for the remaining past paper questions?",
      },
      outgoing: false,
    },
  ],
  "conv-1": [
    {
      id: "m-1-1",
      conversationId: "conv-1",
      senderId: "u-t1",
      senderName: "Dumi Perera",
      content: "Welcome everyone to the A/L Maths group!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      outgoing: false,
    },
    {
      id: "m-1-2",
      conversationId: "conv-1",
      senderId: "current-user",
      senderName: "You",
      content: "Sir, when will we discuss the integration by parts past paper questions?",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      outgoing: true,
    },
    {
      id: "m-1-3",
      conversationId: "conv-1",
      senderId: "u-t1",
      senderName: "Dumi Perera",
      content: "Tomorrow's calculus worksheet has been uploaded to the papers tab.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      replyToId: "m-1-2",
      replyTo: {
        id: "m-1-2",
        senderName: "You",
        body: "Sir, when will we discuss the integration by parts past paper questions?",
      },
      outgoing: false,
    },
  ],
  "conv-2": [
    {
      id: "m-2-1",
      conversationId: "conv-2",
      senderId: "current-user",
      senderName: "You",
      content: "Hello Sir, I had a doubt regarding the uniform electric field question.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      outgoing: true,
    },
    {
      id: "m-2-2",
      conversationId: "conv-2",
      senderId: "u-t2",
      senderName: "Nimal Fernando",
      content: "Great question on electric fields. Review formula E = V/d.",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      outgoing: false,
    },
  ],
  "conv-3": [
    {
      id: "m-3-1",
      conversationId: "conv-3",
      senderId: "u-t3",
      senderName: "Sajini Weerasinghe",
      content: "Please verify your attendance for Saturday's revision session.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      outgoing: false,
    },
  ],
  "conv-4": [
    {
      id: "m-4-1",
      conversationId: "conv-4",
      senderId: "u-t1",
      senderName: "Dumi Perera",
      content: "Who has tried solving the database normalization question?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      outgoing: false,
    },
  ],
};

// In-memory store for active session
let localConversations = [...initialFallbackConversations];
const localMessagesStore = { ...initialFallbackMessages };

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

const baseApiClient = createSkoleApiClient({
  baseUrl,
  fetch: authenticatedFetch,
});

export const skoleApiClient = baseApiClient;

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

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as T;
}

function parseAuthSessionResponse(payload: unknown): {
  role: AppRole | null;
  userId: string;
} {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new Error("The API returned an invalid session response.");
  }

  const data = payload.data;
  if (!data || typeof data !== "object" || !("userId" in data)) {
    throw new Error("The API returned an invalid session response.");
  }

  const userId = data.userId;
  if (typeof userId !== "string" || !userId) {
    throw new Error("The API returned an invalid session response.");
  }

  const role = "role" in data ? data.role : null;
  return {
    role:
      role === "admin" || role === "student" || role === "teacher"
        ? role
        : null,
    userId,
  };
}

let memorySession: string | null = null;

export async function getStoredSession(): Promise<AppSession | null> {
  try {
    let value: string | null = null;

    if (Platform.OS !== "web" && typeof SecureStore.getItemAsync === "function") {
      try {
        const isAvailable = await SecureStore.isAvailableAsync();
        if (isAvailable) {
          value = await SecureStore.getItemAsync("skole-session");
        }
      } catch {
        // SecureStore native module not available or failed
      }
    }

    if (!value && typeof localStorage !== "undefined") {
      try {
        value = localStorage.getItem("skole-session");
      } catch {
        // Ignore localStorage error
      }
    }

    if (!value) {
      value = memorySession;
    }

    if (!value) return null;
    return JSON.parse(value) as AppSession;
  } catch {
    return null;
  }
}

export async function setStoredSession(session: AppSession): Promise<void> {
  const jsonStr = JSON.stringify(session);
  memorySession = jsonStr;

  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem("skole-session", jsonStr);
    } catch {
      // Ignore localStorage error
    }
  }

  if (Platform.OS !== "web" && typeof SecureStore.setItemAsync === "function") {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.setItemAsync("skole-session", jsonStr);
      }
    } catch {
      // Ignore SecureStore error
    }
  }
}

export async function clearStoredSession(): Promise<void> {
  memorySession = null;

  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem("skole-session");
    } catch {
      // Ignore localStorage error
    }
  }

  if (Platform.OS !== "web" && typeof SecureStore.deleteItemAsync === "function") {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.deleteItemAsync("skole-session");
      }
    } catch {
      // Ignore SecureStore error
    }
  }
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

  const session = parseAuthSessionResponse(await response.json());
  const nextSession: AppSession = {
    role: session.role,
    userId: session.userId,
  };

  await setStoredSession(nextSession);
  return nextSession;
}

export async function getCurrentSession(): Promise<AppSession | null> {
  try {
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
      return await getStoredSession();
    }

    const session = parseAuthSessionResponse(await response.json());
    const nextSession: AppSession = {
      role: session.role,
      userId: session.userId,
    };

    await setStoredSession(nextSession);
    return nextSession;
  } catch {
    return await getStoredSession();
  }
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

// -------------------------------------------------------------
// Chat & Messaging Client Layer
// -------------------------------------------------------------

function calculateTimeLabel(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export const chatApi = {
  /**
   * Fetches the user's active conversations from the Fastify backend.
   * If offline or not yet authenticated on the local network, falls back to rich local mock state.
   */
  async getConversations(page = 1, limit = 20): Promise<ApiConversation[]> {
    const session = await getStoredSession();
    const headers: Record<string, string> = {
      accept: "application/json",
    };
    if (session?.token) {
      headers["authorization"] = `Bearer ${session.token}`;
    }

    const candidatePaths = [
      `/conversations?page=${page}&limit=${limit}`,
      `/v1/conversations?page=${page}&limit=${limit}`,
    ];

    for (const path of candidatePaths) {
      try {
        const response = await fetch(`${apiBaseUrl}${path}`, {
          method: "GET",
          credentials: "include",
          headers,
        });

        if (response.ok) {
          const body = (await response.json()) as {
            conversations?: Array<{
              id: string;
              type: ConversationType;
              name: string | null;
              teacherId: string;
              studentId: string | null;
              teacherName: string | null;
              studentName: string | null;
              lastMessageAt: string | null;
              lastMessagePreview: string | null;
              createdAt: string;
            }>;
          };

          if (Array.isArray(body.conversations)) {
            const mapped = body.conversations.map((c) => {
              const displayName =
                c.name ||
                (c.type === "direct"
                  ? c.teacherId === session?.userId
                    ? c.studentName || "Student"
                    : c.teacherName || "Teacher"
                  : "Class Discussion");

              return {
                id: c.id,
                type: c.type,
                name: displayName,
                teacherId: c.teacherId,
                studentId: c.studentId,
                teacherName: c.teacherName,
                studentName: c.studentName,
                lastMessageAt: c.lastMessageAt,
                lastMessagePreview: c.lastMessagePreview,
                createdAt: c.createdAt,
                timeLabel: calculateTimeLabel(c.lastMessageAt),
                unreadCount: 0,
                memberCount: c.type === "class" ? 18 : null,
              };
            });

            // Update local cache
            localConversations = mapped;
            return mapped;
          }
        }
      } catch {
        // Backend not reachable, continue to fallback
      }
    }

    return localConversations;
  },

  /**
   * Fetches messages in a given conversation.
   */
  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<ApiMessage[]> {
    const session = await getStoredSession();
    const currentUserId = session?.userId ?? "current-user";

    const headers: Record<string, string> = {
      accept: "application/json",
    };
    if (session?.token) {
      headers["authorization"] = `Bearer ${session.token}`;
    }

    const candidatePaths = [
      `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      `/v1/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    ];

    for (const path of candidatePaths) {
      try {
        const response = await fetch(`${apiBaseUrl}${path}`, {
          method: "GET",
          credentials: "include",
          headers,
        });

        if (response.ok) {
          const body = (await response.json()) as {
            messages?: Array<{
              id: string;
              conversationId: string;
              senderId: string;
              senderName: string | null;
              senderAvatarUrl: string | null;
              content: string;
              createdAt: string;
              replyToId: string | null;
              deletedAt: string | null;
            }>;
          };

          if (Array.isArray(body.messages)) {
            const mapped = body.messages.map((m) => ({
              ...m,
              outgoing: m.senderId === currentUserId,
            }));

            // Store in local cache
            localMessagesStore[conversationId] = mapped;
            return mapped;
          }
        }
      } catch {
        // Fall through to local cache
      }
    }

    return localMessagesStore[conversationId] ?? [];
  },

  /**
   * Sends a message to a conversation.
   */
  async sendMessage(
    conversationId: string,
    content: string,
    replyToId?: string | null,
  ): Promise<ApiMessage> {
    const session = await getStoredSession();
    const currentUserId = session?.userId ?? "current-user";
    const trimmed = content.trim();

    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json",
    };
    if (session?.token) {
      headers["authorization"] = `Bearer ${session.token}`;
    }

    const candidatePaths = [
      `/conversations/${conversationId}/messages`,
      `/v1/conversations/${conversationId}/messages`,
    ];

    // Find reply target details if any
    const existingMessages = localMessagesStore[conversationId] ?? [];
    const replyTarget = replyToId
      ? existingMessages.find((m) => m.id === replyToId)
      : null;

    let createdMessage: ApiMessage | null = null;

    for (const path of candidatePaths) {
      try {
        const response = await fetch(`${apiBaseUrl}${path}`, {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({
            content: trimmed,
            replyToId: replyToId ?? undefined,
          }),
        });

        if (response.ok) {
          const body = (await response.json()) as {
            id: string;
            conversationId: string;
            senderId: string;
            content: string;
            createdAt: string;
            replyToId?: string | null;
          };

          createdMessage = {
            id: body.id,
            conversationId: body.conversationId,
            senderId: body.senderId,
            senderName: "You",
            content: body.content,
            createdAt: body.createdAt,
            replyToId: body.replyToId,
            outgoing: true,
            replyTo: replyTarget
              ? {
                  id: replyTarget.id,
                  senderName: replyTarget.senderName || "User",
                  body: replyTarget.content,
                }
              : null,
          };
          break;
        }
      } catch {
        // Network unavailable
      }
    }

    // If backend was offline, create a valid local message
    if (!createdMessage) {
      createdMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: currentUserId,
        senderName: "You",
        content: trimmed,
        createdAt: new Date().toISOString(),
        replyToId: replyToId ?? null,
        outgoing: true,
        replyTo: replyTarget
          ? {
              id: replyTarget.id,
              senderName: replyTarget.senderName || "User",
              body: replyTarget.content,
            }
          : null,
      };
    }

    // Update in-memory local messages
    if (!localMessagesStore[conversationId]) {
      localMessagesStore[conversationId] = [];
    }
    localMessagesStore[conversationId].push(createdMessage);

    // Update last message preview in conversations
    const convIndex = localConversations.findIndex((c) => c.id === conversationId);
    if (convIndex >= 0) {
      const conv = localConversations[convIndex];
      localConversations[convIndex] = {
        ...conv,
        lastMessageAt: createdMessage.createdAt,
        lastMessagePreview: createdMessage.content,
        timeLabel: "Now",
      };
      // Move to top of list
      const [updated] = localConversations.splice(convIndex, 1);
      localConversations.unshift(updated);
    }

    return createdMessage;
  },

  /**
   * Starts a new conversation (Direct or Class Group).
   */
  async createConversation(data: {
    type: ConversationType;
    studentId?: string;
    teacherId?: string;
    name?: string;
  }): Promise<ApiConversation> {
    const session = await getStoredSession();
    const currentUserId = session?.userId ?? "current-user";

    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json",
    };
    if (session?.token) {
      headers["authorization"] = `Bearer ${session.token}`;
    }

    const candidatePaths = ["/conversations", "/v1/conversations"];

    for (const path of candidatePaths) {
      try {
        const response = await fetch(`${apiBaseUrl}${path}`, {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({
            type: data.type,
            studentId: data.studentId,
            name: data.name,
          }),
        });

        if (response.ok) {
          const created = (await response.json()) as ApiConversation;
          localConversations.unshift(created);
          return created;
        }
      } catch {
        // Fall through
      }
    }

    // Local fallback
    const newConv: ApiConversation = {
      id: `conv-${Date.now()}`,
      type: data.type,
      name: data.name || "New Conversation",
      teacherId: data.teacherId || currentUserId,
      studentId: data.studentId || currentUserId,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: "Started a new conversation",
      unreadCount: 0,
      memberCount: data.type === "class" ? 1 : null,
      timeLabel: "Now",
    };

    localConversations.unshift(newConv);
    localMessagesStore[newConv.id] = [
      {
        id: `m-init-${Date.now()}`,
        conversationId: newConv.id,
        senderId: currentUserId,
        senderName: "You",
        content: `Conversation started.`,
        createdAt: new Date().toISOString(),
        outgoing: true,
      },
    ];

    return newConv;
  },
};

export type TeacherClassItem = {
  id: string;
  name: string;
  subject: string;
  grade: string;
  medium: "English" | "Sinhala" | "Tamil";
  deliveryType: "group" | "individual";
  schedule: string;
  fee: string;
  enrolledCount: number;
  maxStudents?: number;
  isEnrolled?: boolean;
};

export type TeacherMaterialItem = {
  id: string;
  title: string;
  grade: string;
  subject: string;
  year?: string;
  fileUrl?: string | null;
};

export type TeacherProfileData = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  hourlyRate?: string | null;
  verified: boolean;
  grades: string[];
  subjects: string[];
  mediums: string[];
  locations: string[];
  degreeName?: string | null;
  universityName?: string | null;
  diplomaName?: string | null;
  experience?: string | null;
  classes: TeacherClassItem[];
  materials: TeacherMaterialItem[];
  posts?: Array<{
    id: string;
    title: string;
    body: string;
    time: string;
  }>;
};

const teacherProfilesRegistry: Record<string, TeacherProfileData> = {
  t1: {
    id: "t1",
    name: "Dumi Perera",
    bio: "Senior Mathematics Lecturer & Tutor with over 8 years of experience helping Sri Lankan students achieve Island Ranks in G.C.E. A/L Combined Mathematics. Specializes in Pure Calculus & Mechanics.",
    hourlyRate: "LKR 3,500 / hr",
    verified: true,
    grades: ["A/L", "O/L", "Revision"],
    subjects: ["Combined Maths", "Pure Mathematics", "Applied Mathematics"],
    mediums: ["English", "Sinhala"],
    locations: ["Colombo", "Nugegoda", "Online"],
    degreeName: "B.Sc. (Hons) in Mathematics",
    universityName: "University of Colombo",
    diplomaName: "Postgraduate Diploma in Education (PGDE)",
    experience: "8+ Years Teaching G.C.E. A/L",
    classes: [
      {
        id: "c-t1-1",
        name: "2026 A/L Combined Maths Theory & Sprint",
        subject: "Combined Mathematics",
        grade: "2026 A/L",
        medium: "English",
        deliveryType: "group",
        schedule: "Every Saturday • 8:00 AM - 12:00 PM",
        fee: "LKR 3,000 / month",
        enrolledCount: 142,
        maxStudents: 200,
        isEnrolled: true,
      },
      {
        id: "c-t1-2",
        name: "A/L Integration & Calculus Fast-Track",
        subject: "Pure Mathematics",
        grade: "2025/2026 A/L",
        medium: "English",
        deliveryType: "individual",
        schedule: "Flexible Times • 2 Sessions / Week",
        fee: "LKR 4,500 / session",
        enrolledCount: 8,
        maxStudents: 10,
        isEnrolled: false,
      },
      {
        id: "c-t1-3",
        name: "Past Paper Intensive Review & Model Exams",
        subject: "Combined Mathematics",
        grade: "2025 A/L",
        medium: "Sinhala",
        deliveryType: "group",
        schedule: "Sundays • 1:00 PM - 4:30 PM",
        fee: "LKR 2,500 / month",
        enrolledCount: 98,
        maxStudents: 150,
        isEnrolled: false,
      },
    ],
    materials: [
      {
        id: "mat-1",
        title: "2024 G.C.E. A/L Combined Maths Model Paper 1 (With Marking Scheme)",
        grade: "A/L",
        subject: "Combined Maths",
        year: "2024",
      },
      {
        id: "mat-2",
        title: "Calculus Summary Handbook & Standard Formula Derivatives",
        grade: "A/L",
        subject: "Pure Maths",
        year: "2024",
      },
      {
        id: "mat-3",
        title: "2023 Colombo District Term Test Paper (English Medium)",
        grade: "A/L",
        subject: "Combined Maths",
        year: "2023",
      },
    ],
    posts: [
      {
        id: "post-t1-1",
        title: "Key Formula Sheet Uploaded!",
        body: "I've uploaded the comprehensive integration substitution summary to the Papers tab. Make sure to download and work through the 10 practice questions before Friday.",
        time: "1d ago",
      },
      {
        id: "post-t1-2",
        title: "Reminder: Model Paper Discussion this Saturday",
        body: "All students registered for the Sprint class, please bring your completed draft of Paper II to Saturday's session at 8:00 AM.",
        time: "3d ago",
      },
    ],
  },
  t2: {
    id: "t2",
    name: "Nimal Fernando",
    bio: "Passionate Physics Educator specializing in O/L Science and A/L Physics mechanics, electric circuits, and electronics. Practical-oriented learning methodology.",
    hourlyRate: "LKR 2,800 / hr",
    verified: true,
    grades: ["O/L", "A/L"],
    subjects: ["Physics", "General Science"],
    mediums: ["Sinhala", "English"],
    locations: ["Kandy", "Peradeniya", "Online"],
    degreeName: "B.Sc. in Physical Science",
    universityName: "University of Peradeniya",
    diplomaName: "National Diploma in Technology (NDT)",
    experience: "6 Years Teaching Experience",
    classes: [
      {
        id: "c-t2-1",
        name: "O/L Science (Physics & Chemistry) Masterclass",
        subject: "Science",
        grade: "Grade 11 (O/L)",
        medium: "Sinhala",
        deliveryType: "group",
        schedule: "Wednesdays • 4:00 PM - 6:30 PM",
        fee: "LKR 2,000 / month",
        enrolledCount: 65,
        maxStudents: 100,
        isEnrolled: false,
      },
      {
        id: "c-t2-2",
        name: "A/L Electricity & Magnetism Unit Sprint",
        subject: "Physics",
        grade: "2026 A/L",
        medium: "English",
        deliveryType: "group",
        schedule: "Sundays • 8:30 AM - 11:30 AM",
        fee: "LKR 2,800 / month",
        enrolledCount: 42,
        maxStudents: 80,
        isEnrolled: false,
      },
    ],
    materials: [
      {
        id: "mat-t2-1",
        title: "O/L Science Physics Units Revision Note & MCQs",
        grade: "O/L",
        subject: "Science",
        year: "2024",
      },
    ],
  },
  t3: {
    id: "t3",
    name: "Sajini Weerasinghe",
    bio: "Biology Specialist & Medical Student Mentor. Focuses on cellular biology, genetics, and plant physiology with visual diagrams and past paper techniques.",
    hourlyRate: "LKR 3,000 / hr",
    verified: true,
    grades: ["A/L"],
    subjects: ["Biology", "Applied Genetics"],
    mediums: ["Tamil", "English"],
    locations: ["Galle", "Matara", "Online"],
    degreeName: "B.Sc. in Biological Science",
    universityName: "University of Ruhuna",
    experience: "5 Years A/L Biology Teaching",
    classes: [
      {
        id: "c-t3-1",
        name: "A/L Biology Complete Syllabus Revision",
        subject: "Biology",
        grade: "2025/2026 A/L",
        medium: "Tamil",
        deliveryType: "group",
        schedule: "Saturdays • 2:00 PM - 5:30 PM",
        fee: "LKR 2,800 / month",
        enrolledCount: 54,
        maxStudents: 75,
        isEnrolled: false,
      },
    ],
    materials: [
      {
        id: "mat-t3-1",
        title: "Genetics & Molecular Biology Structure Essay Question Set",
        grade: "A/L",
        subject: "Biology",
        year: "2024",
      },
    ],
  },
};

export const teachersApi = {
  /**
   * Fetches public teacher profile matching web application contract
   */
  async getTeacherProfile(teacherId: string): Promise<TeacherProfileData> {
    const candidatePaths = [
      `/teachers/${teacherId}`,
      `/v1/teachers/${teacherId}`,
    ];

    for (const path of candidatePaths) {
      try {
        const response = await fetch(`${apiBaseUrl}${path}`, {
          method: "GET",
          credentials: "include",
          headers: { accept: "application/json" },
        });

        if (response.ok) {
          const data = (await response.json()) as Partial<TeacherProfileData>;
          if (data && data.name) {
            return {
              id: data.id || teacherId,
              name: data.name,
              avatarUrl: data.avatarUrl,
              bannerUrl: data.bannerUrl,
              bio: data.bio || "Certified teacher on sKole.",
              hourlyRate: data.hourlyRate,
              verified: data.verified ?? true,
              grades: data.grades || ["A/L", "O/L"],
              subjects: data.subjects || ["General"],
              mediums: data.mediums || ["English", "Sinhala"],
              locations: data.locations || ["Colombo"],
              degreeName: data.degreeName,
              universityName: data.universityName,
              diplomaName: data.diplomaName,
              experience: data.experience,
              classes: data.classes || [],
              materials: data.materials || [],
              posts: data.posts || [],
            };
          }
        }
      } catch {
        // Backend not reached, proceed to registry
      }
    }

    // Fallback from registry or generate consistent fallback
    if (teacherProfilesRegistry[teacherId]) {
      return teacherProfilesRegistry[teacherId];
    }

    // Default template for any teacher ID
    return {
      id: teacherId,
      name: teacherId.replace(/-/g, " "),
      bio: "Certified and verified educator on the sKole learning platform.",
      hourlyRate: "LKR 3,000 / hr",
      verified: true,
      grades: ["A/L", "O/L"],
      subjects: ["Mathematics", "Science"],
      mediums: ["English", "Sinhala"],
      locations: ["Colombo", "Online"],
      degreeName: "Bachelor of Science",
      universityName: "National University of Sri Lanka",
      experience: "5+ Years Educational Experience",
      classes: [
        {
          id: `class-${teacherId}-1`,
          name: "Standard Revision & Past Paper Batch",
          subject: "Science & Mathematics",
          grade: "A/L & O/L",
          medium: "English",
          deliveryType: "group",
          schedule: "Saturdays • 9:00 AM - 12:00 PM",
          fee: "LKR 2,500 / month",
          enrolledCount: 30,
          maxStudents: 50,
          isEnrolled: false,
        },
      ],
      materials: [
        {
          id: `mat-${teacherId}-1`,
          title: "Comprehensive Past Paper Revision Guide & Marking Scheme",
          grade: "A/L",
          subject: "Subject Guide",
        },
      ],
    };
  },
};

export const apiClient = Object.assign(baseApiClient, {
  chat: chatApi,
  teachers: teachersApi,
});
