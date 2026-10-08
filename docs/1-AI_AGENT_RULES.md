# AI Agent & Developer Master Rules for Skole Workspace

> **CRITICAL FOR ALL AI AGENTS & DEVELOPERS:** You are working within the `skole-workspace` monorepo. This repository contains two primary codebases: the web monorepo (`skole`) and the standalone mobile app (`mobile`). Always read and adhere to the architectural constraints, design tokens, and workflows outlined below before writing or modifying any code.

---

## 1. Monorepo Architecture & Boundaries

- **Backend Source of Truth:** Fastify API + PostgreSQL (housed in `skole/`). Both web and mobile share this backend.
- **Web Frontend:** Next.js application (`skole/apps/web` or similar).
- **Mobile Frontend:** Standalone Expo + React Native application (`mobile/`).
- **Rule:** Do not duplicate backend business logic in mobile. The mobile app must consume the Fastify endpoints and shared Zod contracts / data types.

## 2. Tech Stack & Version Constraints

- **Package Manager:** `pnpm` (Workspace linking via `workspace:*` or local file paths when applicable).
- **Node Version:** Node.js 24 LTS.
- **Mobile Stack:** Expo SDK 57, React Native, TypeScript, Expo Router.
- **Required Mobile Auth Packages:** `expo-auth-session`, `expo-web-browser`, `expo-secure-store`.

## 3. UI, Styling & Design System Parity

- **Source of Truth for Design:** The web frontend (`skole`) is the visual source of truth.
- **Mobile Styling:** Never hardcode random colors or spacing in mobile. Always import design tokens, colors, and typography from `mobile/src/constants/theme.ts` to ensure 100% visual parity with the web app.

## 4. Environment & Network Rules

- **Backend URL:** Configured via `EXPO_PUBLIC_API_URL`.
- **Local Development Execution:**
  - Database: `docker compose up -d postgres`
  - Backend: `pnpm dev:api`
  - Mobile: `npx expo run:android` (targeting physical devices or emulators using local network IP mapping).

## 5. Mandatory Verification Checklist for Agents

Before concluding any task or submitting changes in the mobile repo, agents must verify:

1. `pnpm run lint` (or relevant workspace lint command) passes cleanly.
2. TypeScript compilation (`tsc --noEmit`) passes with zero errors.
3. UI components match the web app design tokens.
