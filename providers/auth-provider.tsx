import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSetCookie } from "@better-auth/expo/client";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";

import { authClient } from "@/lib/auth-client";
import { authFetch, type AppRole } from "@/services/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null | undefined;
}

export interface AppSession {
  role: AppRole | null;
  userId: string;
  user?: AuthUser | null;
}

export interface AuthContextValue {
  /** The better-auth user (id, name, email, image). null when signed out. */
  user: AuthUser | null;
  /** The Skole application session (userId + role + user). null when signed out. */
  session: AppSession | null;
  /** True while the initial session check is in progress. */
  isLoading: boolean;
  /** Start the Google OAuth flow via the in-app browser. */
  signInWithGoogle: () => Promise<{ error: string | null }>;
  /** Sign out, clear cookies and cached data. */
  signOut: () => Promise<void>;
  /** Force refetch both better-auth user session and Skole app session. */
  refetch: () => Promise<void>;
  refetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL!.replace(/\/+$/, "");

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // 1. better-auth session (user object + cookie validity)
  const betterAuthSession = authClient.useSession();
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const isBetterAuthLoading = betterAuthSession.isPending;

  // Active user: prefer live atom state, fallback to direct session check
  const activeUser: AuthUser | null = useMemo(() => {
    if (betterAuthSession.data?.user) {
      return {
        id: betterAuthSession.data.user.id,
        name: betterAuthSession.data.user.name,
        email: betterAuthSession.data.user.email,
        image: betterAuthSession.data.user.image,
      };
    }
    return sessionUser;
  }, [betterAuthSession.data?.user, sessionUser]);

  // 2. Skole role — fetched from the custom GET /v1/auth/session endpoint,
  //    enabled when an active session or cookie exists.
  const roleQuery = useQuery<{ role: AppRole | null; userId: string } | null>({
    queryKey: ["skole-session"],
    queryFn: async (): Promise<{ role: AppRole | null; userId: string } | null> => {
      const response = await authFetch(`${apiBaseUrl}/v1/auth/session`, {
        headers: { accept: "application/json" },
      });
      if (response.status === 401) return null;
      if (!response.ok) return null;
      const body = (await response.json()) as {
        data?: { role?: AppRole | null; userId?: string };
      };
      if (!body.data?.userId) return null;
      return { role: body.data.role ?? null, userId: body.data.userId };
    },
    enabled: !!activeUser,
    staleTime: 60_000,
    retry: 1,
  });

  const { refetch: refetchBetterAuth } = betterAuthSession;
  const { refetch: refetchRole } = roleQuery;

  // Synchronize both session layers immediately
  const syncSession = useCallback(async () => {
    try {
      // 1. Direct call to better-auth getSession()
      const res = await authClient.getSession();
      if (res?.data?.user) {
        setSessionUser({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          image: res.data.user.image,
        });
      }
      // 2. Refresh the useSession atom
      await refetchBetterAuth();
      // 3. Invalidate and re-query application data
      await queryClient.invalidateQueries({ queryKey: ["skole-session"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      await queryClient.invalidateQueries({ queryKey: ["papers"] });
      await refetchRole();
    } catch (err) {
      console.warn("Session sync error:", err);
    }
  }, [refetchBetterAuth, queryClient, refetchRole]);

  // Handle incoming deep link URLs (e.g. skole:// or skole://?cookie=...)
  const handleDeepLinkUrl = useCallback(
    async (url: string | null) => {
      if (!url || !url.startsWith("skole://")) return;
      try {
        const parsed = new URL(url);
        const cookieParam = parsed.searchParams.get("cookie");
        if (cookieParam) {
          const currentStored = await SecureStore.getItemAsync("skole_cookie");
          const updatedCookie = getSetCookie(
            cookieParam,
            currentStored ?? undefined,
          );
          await SecureStore.setItemAsync("skole_cookie", updatedCookie);
        }
      } catch (err) {
        console.warn("Failed to parse incoming deep link cookie", err);
      }
      await syncSession();
    },
    [syncSession],
  );

  // 3. Listen to deep link events and AppState changes
  useEffect(() => {
    // Cold start deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLinkUrl(url);
      }
    });

    // Foreground / warm deep link listener
    const linkSub = Linking.addEventListener("url", (event) => {
      handleDeepLinkUrl(event.url);
    });

    // AppState listener: when returning from external browser to active app
    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        syncSession();
      }
    });

    return () => {
      linkSub.remove();
      appStateSub.remove();
    };
  }, [handleDeepLinkUrl, syncSession]);

  // 4. Sign in
  const signInWithGoogle = useCallback(async (): Promise<{
    error: string | null;
  }> => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "skole://",
      });
      await syncSession();
      return { error: null };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed.";
      if (/cancel|dismiss|closed/i.test(message)) {
        // User closed the browser or OAuth completed via external intent: sync anyway
        await syncSession();
        return { error: null };
      }
      return { error: message };
    }
  }, [syncSession]);

  // 5. Sign out
  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      await SecureStore.deleteItemAsync("skole_cookie");
      await SecureStore.deleteItemAsync("skole_session_data");
      setSessionUser(null);
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      queryClient.clear();
      await refetchBetterAuth();
      await queryClient.invalidateQueries({ queryKey: ["skole-session"] });
    }
  }, [refetchBetterAuth, queryClient]);

  const combinedSession = useMemo<AppSession | null>(() => {
    if (!roleQuery.data && !activeUser) return null;
    return {
      role: roleQuery.data?.role ?? null,
      userId: roleQuery.data?.userId ?? activeUser?.id ?? "",
      user: activeUser,
    };
  }, [roleQuery.data, activeUser]);

  const isLoading = isBetterAuthLoading || (!!activeUser && roleQuery.isLoading);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: activeUser,
      session: combinedSession,
      isLoading,
      signInWithGoogle,
      signOut,
      refetch: syncSession,
      refetchSession: syncSession,
    }),
    [activeUser, combinedSession, isLoading, signInWithGoogle, signOut, syncSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
