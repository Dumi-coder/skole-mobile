# Mobile Feature Parity & UI Integration

Execution date: 2026-10-08

Branch: `frontend/dum`

## 1. Objective

Extend the `skole-workspace` mobile application (`mobile`) to achieve visual and functional parity with the web application (`skole/apps/web`), while introducing the new mobile-exclusive **Voice Room** feature and updating navigation and home screen layouts.

---

## 2. Navigation & Bottom Bar Requirements

Update the mobile app's bottom tab navigator (e.g., in `mobile/app/(tabs)/_layout.tsx`) to feature exactly four tabs with corresponding icons:

1. **Home** (Icon: Home/Dashboard)
2. **Message** (Icon: Chat/Message bubble)
3. **Voice Room** (Icon: Mic/Audio - _Mobile-exclusive feature_)
4. **My Profile** (Icon: User/Profile)

---

## 3. Web Reference Mapping (`skole/apps/web`)

Agents should inspect the following web implementation files inside `skole/apps/web` to reuse existing layouts, styling patterns, Tailwind/native styling equivalents, and components:

- **Home Page Layout & Filters:** `skole/apps/web/src/app/(dashboard)/home/page.tsx` (or corresponding category/filter components under `skole/apps/web/src/components/`).
- **Header / Branding:** Look at web header components for typography and branding conventions to implement the top-left "sKole" text.
- **Categories / Filter Bar:** Reference the teacher, feed, and papers category tabs and filter mechanics implemented on the web dashboard.

---

## 4. Home Screen Layout & Branding Specifications

- **Top-Left Header:** Display the application name strictly as **"sKole"** in text formatting at the top-left corner of the mobile home view.
- **Category & Filter Bar:** Replicate the web home screen's top category and filter structure. The mobile home screen must support switching/filtering across the same three core categories found on the web:

1. **Teacher**
2. **Feed**
3. **Papers**

- **Styling Consistency:** Adopt the visual styles, color palettes, spacing, and typography rules from the web app (`skole/apps/web`) and adapt them to React Native / Expo styling.
