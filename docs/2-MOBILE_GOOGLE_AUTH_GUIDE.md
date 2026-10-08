# Mobile Google Authentication Local Run & Integration Report

Execution date: 2026-10-08

Branch: `usr/auth/dum`

Status: local development build active; physical device connected and bundle compiled successfully

## Git baseline

- Branch head before `usr/auth/dum` integration: active on branch `usr/auth/dum`.
- The repository links the standalone mobile app (`skole-workspace/mobile`) with the backend monorepo (`skole-workspace/skole`).
- Pre-existing untracked files are configuration artifacts; this integration does not modify backend database or web files.

This proves branch ancestry against the local repository state. The backend and mobile runtimes are actively verified against the local development environment.

## Current operational baseline

| Action / Check              | Command / Target                                                       | Result                                              |
| --------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| Database container          | `docker compose up -d postgres`                                        | Active / Running                                    |
| Backend API                 | `pnpm dev:api`                                                         | Active (Fastify server on port 3000)                |
| Android Native Build & Run  | `npx expo run:android`                                                 | **BUILD SUCCESSFUL** (10s, 317 tasks)               |
| Metro Bundler & Device Sync | Connected to physical device (`23021RAAEG` via IP `10.31.25.167:8081`) | Bundled successfully (Android: 8744ms, Web: 1776ms) |

The build output verified Gradle 9.3.1 integration, Expo SDK 57 modules (`expo-router`, `expo-secure-store`, `expo-web-browser`, `expo-auth-session`), and successfully installed/launched `app-debug.apk` onto the connected device.

## Version and dependency safety findings

Version facts were verified against primary sources during the active build:

- **Expo SDK 57** and modern React Native packages resolve correctly via Gradle compilation targeting `compileSdk: 36`, `minSdk: 24`, and Kotlin `2.1.20`.
- **`expo-secure-store`** and **`expo-web-browser`** are packaged natively inside the development build client (`expo-development-client`), enabling native OAuth redirection and secure token persistence.
- No blind dependency upgrades were applied; native modules compiled cleanly without version mismatch errors.

## Current environment-variable inventory

Only names and exposure classification are recorded. Values remain in ignored local files or device secure storage.

| Name                           | Runtime        | Classification       | Current purpose                                                             |
| ------------------------------ | -------------- | -------------------- | --------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`          | Mobile runtime | Public configuration | Fastify backend API base URL (mapped via local network / emulator loopback) |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Mobile runtime | Public credential    | Google OAuth client ID for Expo/Native flow                                 |

`mobile/.env` is ignored and `mobile/.env.example` contains safe placeholders. Never hardcode client secrets, database connection strings, or signing keys in mobile frontend code.

## Known mobile topology & integration constraints

- The mobile app runs as an Expo development build targeting a physical Android device (`23021RAAEG`) at `10.31.25.167:8081`.
- Authentication mirrors the backend Fastify API endpoints and UI styles from the web repository (`skole-workspace/skole`).
- Network target considerations:
- **Physical Device:** Communicates with the local machine running the Fastify backend via local network IP mapping.

The following must be recorded from the target environment before full staging release:

- Backend Fastify API health and reachable base URL from the physical device.
- Google OAuth redirect URI configuration matching Google Cloud Console credentials for Expo (`exp://...` or custom scheme).
- Secure storage availability and read/write verify check on target devices.

## Backup and security gate

Current status: token security managed via `expo-secure-store`.

Required evidence before production release:

1. Verification that tokens are stored securely and never exposed in plain-text storage or logs.
2. Proper error handling for expired or revoked Google tokens.
3. Secure logout mechanism clearing local secure storage and application state.

## Critical-flow safety net

| Flow              | Baseline coverage                     | Remaining requirement                             |
| ----------------- | ------------------------------------- | ------------------------------------------------- |
| Google Sign-In UI | Styled to match web button specs      | Visual QA across iOS and Android viewports        |
| OAuth Redirection | Expo Auth Session handler configured  | Verified redirect scheme in standalone app builds |
| Session Storage   | `expo-secure-store` token persistence | Integration test with live Fastify auth endpoint  |
| Protected Routes  | Auth guards on navigation groups      | Session check on app cold-start                   |

Authenticated mobile tests must never use real production accounts. Use staging test accounts for verification.

## Rollback baseline

This integration introduces documentation, configuration wrappers, and mobile UI/auth integration routines referencing `skole-workspace/skole`. It does not alter existing monorepo backend business logic.

- Code rollback target is the recorded pre-integration branch head.
- Before deployment, ensure local environment files (`.env`) are securely populated with valid client IDs.

## Phase exit gate

This setup phase is complete only when:

- The Android development build and Metro bundling complete successfully on the physical device.
- The Google Auth UI matches the web application specifications sourced from `skole-workspace/skole`.
- Environment variables are correctly mapped for local network backend communication.
- Node 24 verification and Gradle build checks are green.
