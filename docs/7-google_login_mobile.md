# SKOLE MOBILE: GOOGLE LOGIN (better-auth + Expo) IMPLEMENTATION

## 0. ROLE AND RULES

You are implementing Google sign-in in the Skole MOBILE app (Expo Router,
React Native, TypeScript). The web app already has working Google login with
better-auth, and the Fastify backend is shared by web and mobile.

- Never print, log, commit or hard-code secrets (AUTH_SECRET, Google client
  secret, DB password). Use environment variables only.
- Do NOT break the web login. Backend changes must be additive.
- Work in this order, and show a short summary after each step:
  1. Inspect 2) Backend 3) Mobile client 4) Provider 5) UI 6) Test.
- If something here conflicts with what you find in the code, tell me before
  changing the plan.

## 1. HOW THE EXISTING SYSTEM WORKS (verified from the web repo)

- Backend: Fastify + better-auth, mounted at basePath "/v1/auth".
  Google is configured as a social provider.
- Web sign-in: authClient.signIn.social({ provider: "google", callbackURL })
  (redirect flow). The session is an HttpOnly cookie, sent with
  credentials: "include". "Signed in" means authClient.useSession() has data.
- Web route guard: public = /home/feed, /home/teachers\*, /home/papers.
  Everything else needs a user.
- Custom session endpoint: GET /v1/auth/session returns
  { data: { userId, role } } and 401 when signed out
  (role: "admin" | "student" | "teacher" | null).
- Web env names: NEXT_PUBLIC_API_URL. Backend env names: AUTH_BASE_URL,
  AUTH_SECRET, AUTH_GOOGLE_CLIENT_ID, AUTH_GOOGLE_CLIENT_SECRET,
  CORS_ORIGINS, PUBLIC_API_URL.

## 2. TARGET DESIGN

Use better-auth's Expo integration instead of hand-made token calls:

- The Expo plugin on the server accepts deep-link callbacks.
- The expoClient plugin on the app opens Google in a secure in-app browser,
  receives the deep link (scheme "skole"), and stores the session cookie in
  expo-secure-store.
- Every API request from the app attaches that cookie in a Cookie header
  (credentials "omit").
  Home (Teachers, Feed, Papers) stays public. Messages and Profile require login.

## 3. STEP 1: INSPECT (no edits yet)

Backend (apps/api):

- Find the betterAuth({...}) config: plugins, trustedOrigins, baseURL,
  session/cookie options, database adapter.
- Find where better-auth is mounted in Fastify and how CORS is configured.
- Find the code behind GET /v1/auth/session and the middleware that protects
  routes. Confirm whether the session is read from the Cookie header in a way
  that also works when a non-browser client sends it.
  Mobile:
- Read services/api.ts, app/\_layout.tsx, app.json, package.json.
  Report: current trustedOrigins, whether the Expo plugin is already present,
  and any risk you see. Then wait for my confirmation.

## 4. STEP 2: BACKEND CHANGES (additive only)

1. Install: @better-auth/expo (same major version family as better-auth).
2. In the better-auth config:
   - import { expo } from "@better-auth/expo"; add expo() to plugins.
   - Add to trustedOrigins (keep every existing origin):
     "skole://", "skole://_"
     and, for development only (guarded by NODE_ENV !== "production"):
     "exp://_" (Expo Go style URLs, optional)
3. Make sure the Google provider's redirect URI uses the public API URL:
   {AUTH_BASE_URL}/v1/auth/callback/google.
4. CORS: native requests send no browser Origin, so no change is expected.
   Do not widen CORS_ORIGINS to "\*".
5. Confirm GET /v1/auth/session works when the Cookie header is sent manually
   (test with curl after login).
6. Do not rename env variables or touch the web code.

## 5. STEP 3: MOBILE CLIENT

1. Install in the mobile repo: better-auth, @better-auth/expo. (Already
   present: expo-secure-store, expo-web-browser, expo-linking, expo-router.
   expo-auth-session is NOT needed for this flow.)
2. Create lib/auth-client.ts:

   import { createAuthClient } from "better-auth/react";
   import { expoClient } from "@better-auth/expo/client";
   import \* as SecureStore from "expo-secure-store";

   export const authClient = createAuthClient({
   baseURL: process.env.EXPO_PUBLIC_API_URL,
   basePath: "/v1/auth",
   plugins: [
   expoClient({
   scheme: "skole",
   storagePrefix: "skole",
   storage: SecureStore,
   }),
   ],
   });

3. Environment: EXPO_PUBLIC_API_URL must be a URL the device can reach and
   that Google accepts as a redirect host (see section 8). Remove the
   "http://localhost:3001" fallback; throw a clear dev error if it is missing.
4. Rewrite services/api.ts:
   - Remove signInWithEmail, signInWithGoogle(idToken), the
     googleAuthFallbackPaths loop and the manual "skole-session" SecureStore
     code. They are replaced by better-auth.
   - Add one authFetch(path, init) helper:
     const cookie = authClient.getCookie();
     fetch(url, { ...init, credentials: "omit",
     headers: { ...init?.headers, Cookie: cookie } })
     On 401, call authClient.signOut() locally and let the guard show login.
   - Keep createSkoleApiClient, but pass it a custom fetch that uses
     authFetch (or the Cookie header) so all existing calls are authenticated.
     Verify the @skole/api-client constructor options before doing this.
   - Check that @skole/api-client and @skole/contracts resolve in the mobile
     repo (they are not in package.json). If not, tell me how they are linked
     or propose a fix; do not invent a workaround silently.

## 5.1 STEP 4: AUTH PROVIDER (mirror the web API)

Create providers/auth-provider.tsx with the same shape as the web provider:
{ user, session, isLoading, signInWithGoogle, signOut }

- user comes from authClient.useSession().data?.user
  (id, name, email, image).
- role comes from GET /v1/auth/session via authFetch (React Query), because
  better-auth's own session does not include the Skole role.
- signInWithGoogle:
  authClient.signIn.social({ provider: "google", callbackURL: "/" })
  and return { error: string | null }. Handle the user closing the browser
  without error noise.
- signOut: authClient.signOut(), then clear React Query cache.
- Wrap the app in app/\_layout.tsx (QueryClientProvider, then AuthProvider).
- Show the splash screen until isLoading is false, to avoid a login flash.

## 6. STEP 5: UI AND ROUTE GUARD

- Public: (tabs)/index (Home) and teachers/[teacherId].
- Protected: (tabs)/messages, (tabs)/profile, chat/[conversationId].
  Voice Room stays a placeholder and is not protected yet.
- Guard approach: do NOT hard-redirect. When a signed-out user opens a
  protected tab, render a LoginPrompt screen/sheet in place of the content,
  with a "Continue with Google" button. After login, show the real screen.
- Create components/auth/LoginSheet.tsx and a GoogleButton component:
  - Outlined button, Google "G" logo, label "Continue with Google",
    loading state "Signing in...".
  - Errors use the project's FieldError / form-level error style
    (red text, soft tinted box). No hard-coded colors; use constants/Colors.
  - Light and dark theme, 44px minimum touch target, accessibility label.
- Profile tab, signed in: name, email, avatar, role, and a Sign out button.
- Add `// TODO` comments only where a decision is pending; no dead code.

## 7. FILES TO TOUCH

Backend: better-auth config, package.json (@better-auth/expo)
Mobile: lib/auth-client.ts (new), services/api.ts (rewrite),
providers/auth-provider.tsx (new), app/\_layout.tsx,
components/auth/GoogleButton.tsx and LoginSheet.tsx (new),
app/(tabs)/profile.tsx and messages.tsx (guard), .env.example (new)

## 8. LOCAL TESTING (important)

- Google only accepts https:// or http://localhost redirect URIs for this
  flow, and the redirect goes to the SERVER callback, not the app.
- Use an HTTPS tunnel (ngrok or Cloudflare Tunnel) to the Fastify API:
  1. Start the tunnel to port 3001 and copy the https URL.
  2. Backend .env: AUTH_BASE_URL and PUBLIC_API_URL = tunnel URL.
  3. Mobile .env: EXPO_PUBLIC_API_URL = tunnel URL.
  4. Google Cloud Console, OAuth client (Web), add the authorized redirect
     URI: https://<tunnel>/v1/auth/callback/google
  5. The tunnel URL changes on free plans, so update all three each time or
     use a reserved domain.
- Use a DEVELOPMENT BUILD (npx expo run:android / run:ios), not Expo Go.
- Android emulator without a tunnel can use http://10.0.2.2:3001 for plain
  API calls, but Google login still needs the HTTPS tunnel.

## 9. SECURITY CHECKLIST

- Rotate any secret that was ever pasted into chat or committed: the Google
  client secret and AUTH_SECRET.
- .env files are in .gitignore; add .env.example with variable names only.
- Cookie is stored only in expo-secure-store, never AsyncStorage or logs.
- Do not log the cookie or session in the console.
- Production: HTTPS only, exact trustedOrigins (no wildcards other than the
  app scheme), remove the dev "exp://\*" origin.

## 10. DEFINITION OF DONE

- Tapping "Continue with Google" opens Google in the in-app browser, returns
  to the app, and the user is signed in.
- After killing and reopening the app, the user is still signed in.
- GET /v1/auth/session returns the user's role from the app.
- Messages and Profile show the login prompt when signed out, and the real
  screens when signed in. Home works signed out.
- Sign out clears the session and cached data.
- Web login still works exactly as before.
- TypeScript compiles with no errors and no unused code.
