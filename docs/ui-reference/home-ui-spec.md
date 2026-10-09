# Mobile Home Screen UI & Functional Specification

## 1. Overview

This document specifies the implementation requirements for the mobile home screen, matching the web design references stored in `mobile/docs/ui-reference/screenshots/Home/`. The layout must ensure visual parity with the web application while being fully responsive across all Android device densities.

---

## 2. Header & Top Navigation

- **Branding:** Display **"sKole"** as clear text in the top-left corner of the header area, using mobile typography theme tokens (`mobile/src/constants/theme.ts`).
- **Category Segmented Control:** Render a primary category selector right below the header containing three options:
  1. **Teachers**
  2. **Feed**
  3. **Papers**

---

## 3. Category-Specific Filters & Search

### A. Teachers Tab

When the **Teachers** category is active, render a horizontal filter bar containing:

- **Search Button / Input:** For searching teachers by name or keywords.
- **Grade Filter Pill:** Dropdown selector for grade options.
- **Subject Filter Pill:** Dropdown selector for subject options.
- **Medium Filter Pill:** Dropdown selector for medium (e.g., English, Sinhala, Tamil).
- **Location Filter Pill:** Dropdown selector for location/region.

### B. Papers Tab

When the **Papers** category is active, render a horizontal filter bar containing:

- **Search Button / Input:** For searching past papers or resource materials.
- **Grade Filter Pill:** Dropdown selector for grade options.
- **Subject Filter Pill:** Dropdown selector for subject options.
- **Medium Filter Pill:** Dropdown selector for medium options.
  _(Note: Papers filter excludes the location filter)._

### C. Feed Tab

When the **Feed** category is active:

- Render chronological community/teacher post cards.
- Support pull-to-refresh behavior.
- Maintain a clean card layout with author profile details, timestamp, and rich media/text content blocks.

---

## 4. Android Responsiveness & Styling Guidelines

- **Container Layout:** Wrap screens in `SafeAreaView` from `react-native-safe-area-context`.
- **Scrolling Lists:** Use `FlatList` or `ScrollView` with appropriate bottom padding (`contentContainerStyle={{ paddingBottom: 24 }}`) to prevent hardware gesture bar overlap on Android devices.
- **Styling tokens:** Map web styles strictly to tokens defined in `mobile/src/constants/theme.ts` (card rounded corners, border colors, and padding spacing).
