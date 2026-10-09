# sKole Mobile — AI Agent Instructions

> **Purpose:** Help VS Code coding agents make correct, focused, verifiable changes to the sKole mobile app with minimal unnecessary repository exploration and AI usage.
>
> **Scope:** These instructions are for `mobile/`. All work must stay strictly within the `mobile/` directory unless an authorized backend change is explicitly requested.

## 1. Start Here: Minimal Context Workflow

For every task, follow this sequence. Keep investigation proportional to the task.

1. **Read applicable instructions.** Check parent and nested `AGENTS.md` files that apply to the files being changed.
2. **Check the working tree.** Run `git status --short` and identify the current branch before editing. Preserve all existing user changes.
3. **Classify the task.**
   - **Small:** copy, styling tweak, typo, isolated bug → inspect the relevant file and its immediate dependencies.
   - **Feature or integration:** inspect the relevant route/screen, shared components, services/types, and the directly related docs.
   - **Architecture/security/auth/navigation change:** inspect the relevant architecture, backend contract, and decision records before planning.
4. **Read only relevant documentation.** Use the docs index if one exists. Do not read every document or scan the whole repository by default.
5. **Trace existing patterns.** Search for a similar screen, component, route, API call, or test and reuse the established approach.
6. **Implement the smallest complete change** that satisfies the acceptance criteria.
7. **Verify and review.** Run relevant checks, inspect the diff, and report exactly what was and was not tested.

## 2. Expo & React Native Rules — Do Not Trust Training Data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch `https://docs.expo.dev/llms.txt` — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

- **Continuous Native Generation (CNG):** If `ios/` and `android/` directories do not exist, they are generated automatically. Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- **Development Builds:** Expo Go only includes its bundled native modules. After adding a library with native code (such as secure storage or auth), the app needs a development build (`npx expo run:android` locally, or `eas build --profile development`).

## 3. Workspace and Repository Boundaries

Expected workspace:

```text
skole-workspace/
├── skole/   # Existing web frontend and shared backend (Design & API reference only)
└── mobile/  # Standalone Expo / React Native app (Implementation scope)
```

## 4. Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, and `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Use the approved mobile destinations (Home, Message, Voice Room, and My Profile tabs) following the project specification. Do not copy a web sidebar into the mobile app.

## 5. Design System and Mobile UX

The existing sKole web app is the reference for brand identity; the mobile app must adapt it to a native mobile experience rather than copy desktop layouts.

- Use existing mobile theme tokens (`mobile/src/constants/theme.ts`) for colors, typography, spacing, radii, and borders.

- Reuse existing mobile components and icon libraries. Do not substitute emoji for established icons.

- Adapt layouts for screen sizes, touch input, safe areas, keyboard behavior, and scrolling. Check for clipped text, horizontal overflow, and inaccessible touch targets.

- Implement relevant loading, error, empty, and success states.

## 6. API, Authentication, and Data Handling

- Use the existing API client and service layer.

- Resolve the base URL through `EXPO_PUBLIC_API_URL`. Never hardcode URLs or put server secrets in public Expo variables.

- Confirm endpoint paths, methods, and request/response schemas from the Fastify backend contracts, using the web app as a secondary reference.

## 7. Commands & Verification

Verify each command against package scripts before running:

```bash
npx expo install <package>  # ALWAYS use instead of pnpm add / npm install — resolves SDK-compatible versions
npx expo start              # start the Metro dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions

```

- Run lint and typecheck before declaring any task done.
- For physical device testing, ensure `EXPO_PUBLIC_API_URL` uses your local network IP address rather than `localhost`.

## 8. Git and Change Safety

- Check `git status --short` and `git branch --show-current` before editing.

- Preserve pre-existing changes and untracked files. Do not run destructive Git commands without authorization.

- Before finishing, inspect `git diff --check` and confirm changes are within scope.

**Definition of done:** The requested behavior is implemented within scope, follows existing architecture and design conventions, relevant checks are reported honestly, the diff contains no unrelated changes, and remaining limitations are explicit.
