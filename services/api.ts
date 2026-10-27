import { getCookie } from "@better-auth/expo/client";
import { createSkoleApiClient } from "@skole/api-client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { authClient } from "@/lib/auth-client";
import { formatCompactTime } from "@/lib/date";
import { resolveAssetUrl } from "@/lib/media";

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
  return formatCompactTime(isoString);
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
  medium: string;
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

export type TeacherPostItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  mediaUrl?: string | null;
};

export type TeacherAlResultItem = {
  subject: string;
  grade: string;
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
  undergradDegreeName?: string | null;
  universityName?: string | null;
  diplomaName?: string | null;
  facultyName?: string | null;
  experience?: string | null;
  alResults?: TeacherAlResultItem[];
  classes: TeacherClassItem[];
  materials: TeacherMaterialItem[];
  posts?: TeacherPostItem[];
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatClassSchedule(cls: {
  scheduleKind?: "fixed" | "recurring" | null;
  slots?: Array<{ dayOfWeek: number; startTime: string; endTime: string | null }>;
  classDate?: string | null;
  classTime?: string | null;
  classEndTime?: string | null;
}): string {
  if (cls.slots && cls.slots.length > 0) {
    return cls.slots
      .map((s) => {
        const day = DAY_NAMES[s.dayOfWeek] ?? `Day ${s.dayOfWeek}`;
        return s.endTime
          ? `${day}s • ${s.startTime} - ${s.endTime}`
          : `${day}s • ${s.startTime}`;
      })
      .join("; ");
  }
  if (cls.classDate) {
    const timePart = cls.classTime
      ? ` • ${cls.classTime}${cls.classEndTime ? ` - ${cls.classEndTime}` : ""}`
      : "";
    return `${cls.classDate}${timePart}`;
  }
  return "Schedule on request";
}

function formatClassFee(cls: {
  paymentAmount?: number;
  paymentType?: "per_hour" | "per_class" | "per_month";
}): string {
  const amount = cls.paymentAmount ?? 0;
  if (!amount) return "Free";
  const formattedAmount = `LKR ${amount.toLocaleString()}`;
  switch (cls.paymentType) {
    case "per_hour":
      return `${formattedAmount} / hr`;
    case "per_month":
      return `${formattedAmount} / month`;
    case "per_class":
      return `${formattedAmount} / session`;
    default:
      return formattedAmount;
  }
}

export const teachersApi = {
  /**
   * Fetches public teacher profile directly from the backend database.
   */
  async getTeacherProfile(teacherId: string): Promise<TeacherProfileData> {
    const profile = await baseApiClient.getPublicTeacherProfile(teacherId);
    if (!profile) {
      throw new Error("Teacher profile not found.");
    }

    const [classesRes, materialsRes, feedRes] = await Promise.allSettled([
      baseApiClient.getTeacherClasses(teacherId, { limit: 50, offset: 0 }),
      baseApiClient.searchMaterials({ teacherId, limit: 50, offset: 0 }),
      baseApiClient.getFeed({ teacherId, limit: 10, offset: 0 }),
    ]);

    const rawClasses =
      classesRes.status === "fulfilled" ? classesRes.value.items : [];
    const rawMaterials =
      materialsRes.status === "fulfilled" ? materialsRes.value.materials : [];
    const rawPosts =
      feedRes.status === "fulfilled" ? feedRes.value.posts : [];

    // Fetch enrollment state if user has active session
    let enrolledClassIds = new Set<string>();
    let enrollmentCounts: Record<string, number> = {};
    if (rawClasses.length > 0) {
      try {
        const classIds = rawClasses.map((c) => c.id);
        const enrollmentState = await baseApiClient.getEnrollmentState(
          classIds,
          "cookie-session",
        );
        if (enrollmentState) {
          enrolledClassIds = new Set(enrollmentState.enrolledClassIds);
          enrollmentCounts = enrollmentState.enrollmentCounts;
        }
      } catch {
        // Not logged in or enrollment state check omitted
      }
    }

    const classes: TeacherClassItem[] = rawClasses.map((c) => ({
      id: c.id,
      name:
        c.name ||
        `${c.gradeName ?? ""} ${c.subjectName ?? ""}`.trim() ||
        "Class Session",
      subject: c.subjectName || "General",
      grade: c.gradeName || "All Grades",
      medium: c.medium
        ? `${c.medium.charAt(0).toUpperCase()}${c.medium.slice(1)}`
        : "English",
      deliveryType: c.deliveryType,
      schedule: formatClassSchedule(c),
      fee: formatClassFee(c),
      enrolledCount: enrollmentCounts[c.id] ?? c.enrolledStudentCount ?? 0,
      maxStudents: c.maxStudents ?? undefined,
      isEnrolled: enrolledClassIds.has(c.id),
    }));

    const materials: TeacherMaterialItem[] = rawMaterials.map((m) => ({
      id: m.id,
      title: m.title,
      grade: m.grade,
      subject: m.subject,
      year: m.year ? String(m.year) : undefined,
      fileUrl: m.fileUrl,
    }));

    const posts: TeacherPostItem[] = rawPosts.map((p) => {
      const assetUrl = (p as any).assets?.[0]?.url;
      return {
        id: p.id,
        title: p.teachingMeta || "Teacher Update",
        body: p.content,
        time: calculateTimeLabel(p.createdAt),
        mediaUrl: assetUrl ? resolveAssetUrl(assetUrl) : null,
      };
    });

    // Mediums from classes
    const mediumsSet = new Set<string>();
    classes.forEach((c) => {
      if (c.medium) mediumsSet.add(c.medium);
    });
    const mediums =
      mediumsSet.size > 0 ? Array.from(mediumsSet) : ["English", "Sinhala"];

    const hourlyClass = classes.find((c) => c.fee.includes("/ hr"));
    const hourlyRate = hourlyClass ? hourlyClass.fee : null;

    return {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatarUrl ? resolveAssetUrl(profile.avatarUrl) : null,
      bannerUrl: profile.bannerUrl ? resolveAssetUrl(profile.bannerUrl) : null,
      bio: profile.bio,
      hourlyRate,
      verified: profile.verified,
      grades: profile.grades ?? [],
      subjects: profile.subjects ?? [],
      mediums,
      locations: profile.locations ?? [],
      degreeName: profile.degreeName,
      undergradDegreeName: profile.undergradDegreeName,
      universityName: profile.universityName,
      diplomaName: profile.diplomaName,
      facultyName: profile.facultyName,
      experience: profile.facultyName
        ? `Faculty of ${profile.facultyName}`
        : null,
      alResults: profile.alResults ?? [],
      classes,
      materials,
      posts,
    };
  },

  /**
   * Enrolls in a teacher's class.
   */
  async enrollInClass(classId: string): Promise<{ id: string }> {
    return baseApiClient.enrollInClass(classId, "cookie-session");
  },

  /**
   * Starts or returns an existing direct conversation with a teacher.
   */
  async getDirectConversation(teacherId: string): Promise<{ id: string }> {
    return baseApiClient.getDirectConversation(teacherId, "cookie-session");
  },
};

export const apiClient = Object.assign(baseApiClient, {
  chat: chatApi,
  teachers: teachersApi,
});
