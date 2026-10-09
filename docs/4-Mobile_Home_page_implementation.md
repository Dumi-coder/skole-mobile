# TASK: Mobile Home Page Implementation & Android Responsive UI

Execution date: 2026-10-09

Branch: `frontend/dum`

## ACCEPTANCE CRITERIA:

- The mobile app features a bottom navigation bar with exactly four tabs in order: **Home**, **Message**, **Voice Room** (mobile-exclusive feature), and **My Profile**, utilizing standard, non-emoji icons.
- The mobile home screen displays **"sKole"** as clear text in the top-left corner.
- The home screen includes category tabs mirroring the web reference (`Teacher`, `Feed`, and `Papers`).
- The **Teacher** and **Papers** sections include corresponding search inputs and filter controls matching the web web-app architecture (`skole/apps/web`).
- Layouts are fully responsive across all Android screen sizes and densities, utilizing safe area views, flexible widths, and proper padding to prevent clipping or overflow.

## REFERENCES:

- **Web Reference Layouts & Filters:** - `skole/apps/web/src/app/(dashboard)/home/teachers/page.tsx`
- `skole/apps/web/src/app/(dashboard)/home/feed/page.tsx`
- `skole/apps/web/src/app/(dashboard)/home/papers/page.tsx`
- `skole/apps/web/src/components/home/home-view.tsx`
- `skole/apps/web/src/components/home/filter-bar.tsx`

- **Design & Theme:** `mobile/src/constants/theme.ts`
- **Guidelines:** `mobile/AGENTS.md` (Scope, Minimal Context Workflow, Design System & Mobile UX)

## SCOPE:

- **Allowed:** `mobile/`
- **Do not modify:** `skole/` (Web/Backend code is reference-only; do not change backend contracts or web source code)

## IMPLEMENTATION INSTRUCTIONS FOR AGENTS:

1. **Navigation Layout (`mobile/app/(tabs)/_layout.tsx`):**

- Update the bottom tab navigator to define 4 tabs: `index` (Home), `messages` (Message), `voiceroom` (Voice Room), and `profile` (My Profile).
- Assign appropriate vector/icon sets consistent with existing mobile design tokens.

2. **Home Screen (`mobile/app/(tabs)/index.tsx` or matching router path):**

- Render the **"sKole"** brand heading in the top-left header zone using typography tokens from `mobile/src/constants/theme.ts`.
- Implement category selection controls for **Teacher**, **Feed**, and **Papers**.
- Wire up local state or search query parameters to swap between filtered lists for Teachers, Posts, and Papers following the logic found in `skole/apps/web/src/components/home/home-view.tsx`.

3. **Android Responsiveness:**

- Wrap containers in `SafeAreaView` from `react-native-safe-area-context`.
- Use `ScrollView` or `FlatList` with `contentContainerStyle={{ paddingBottom: 32 }}` to protect against gesture bar overlap on physical Android devices.
- Avoid fixed pixel dimensions for card items or containers; use flexbox and percentage layouts.

## VERIFY:

- [ ] Run mobile type check (`pnpm exec tsc --noEmit` or project script)
- [ ] Run mobile lint check
- [ ] Inspect the rendered UI on an Android emulator or physical device to verify touch targets, spacing, and the top-left "sKole" branding layout.
