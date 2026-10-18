# SKOLE MOBILE APP: FRONTEND / UI-UX MASTER PROMPT

## 1. CONTEXT

Skole is a tutor-finding platform for Sri Lanka. A web app (Next.js + Tailwind

- shadcn) already exists, with a shared backend. We are building the MOBILE
  frontend in a separate Expo (React Native, Expo Router, TypeScript) repo.

GOAL: make the mobile UI look and feel like the web app (same colors, shapes,
spacing, chips and order of content), adapted to native mobile patterns.

## 2. SCOPE (read carefully)

IN SCOPE

- Frontend, UI and UX only.
- Four bottom tabs: Home, Messages, Voice Room, Profile.
- Light and dark theme.
- All data comes from a MOCK data layer for now (see section 7).

OUT OF SCOPE (do not build or stub beyond what is described)

- Authentication, login, tokens, route guards. Treat the user as signed in
  with a fake profile. Add a single `// TODO(auth)` comment where the real
  auth will plug in later.
- Backend or API integration. Keep the service layer swappable (section 7).
- Voice Room functionality. It is a "Coming soon" placeholder only.

## 3. TECH RULES

- Expo Router (file-based), TypeScript strict, React Native StyleSheet.
- State: React Query for server-like data, Zustand for UI state (theme,
  filters). Keep state minimal.
- No hard-coded hex values inside feature components. Every color comes from
  `constants/Colors.ts` or `constants/badgeStyles.ts`.
- Respect the phone's color scheme (`useColorScheme`) and also allow a manual
  override stored in the UI store.
- Touch targets are at least 44x44. Add accessibility labels on icon-only
  buttons. Support Dynamic Type (don't lock font sizes harshly).
- Keep screens thin: screens fetch via hooks and compose components. No
  business logic in `app/`.

## 4. FILE STRUCTURE (create exactly this)

mobile/
├── app/
│ ├── \_layout.tsx # Providers: QueryClient, theme, fonts
│ ├── +html.tsx
│ ├── +not-found.tsx
│ ├── (tabs)/
│ │ ├── \_layout.tsx # Bottom bar: Home, Messages, Voice Room, Profile
│ │ ├── index.tsx # Home
│ │ ├── messages.tsx
│ │ ├── voice-room.tsx # Placeholder
│ │ └── profile.tsx
│ ├── teachers/[teacherId].tsx # Teacher public profile (stack screen)
│ └── chat/[conversationId].tsx # Chat window (stack screen, over the tab bar)
├── components/
│ ├── ui/ Avatar, Badge, Button, Card, Input, SegmentedControl,
│ │ FieldError, EmptyState
│ ├── home/ HomeTabs, FilterBar, TeachersTab, FeedTab, PapersTab
│ ├── teachers/ TeacherCard, TeacherProfileView
│ ├── feed/ FeedPostCard
│ ├── papers/ PaperItem
│ ├── messages/ ConversationList, MessageBubble, MessageComposer
│ ├── profile/ ProfileHeader, ProfileSettings
│ └── voice-room/ # empty for now
├── constants/ Colors.ts, badgeStyles.ts, theme.ts
├── hooks/ useTeachers, useFeed, usePapers, useConversations,
│ useProfile, useTheme, useInfiniteList
├── services/ api.ts, teachers.ts, feed.ts, papers.ts, messages.ts,
│ profile.ts
├── lib/ teacherDisplay.ts, queryClient.ts
├── types/ teacher.ts, feed.ts, home.ts, message.ts, profile.ts
├── store/ uiStore.ts
└── assets/ fonts, images
Delete template leftovers: (tabs)/two.tsx, EditScreenInfo.tsx,
ExternalLink.tsx, StyledText.tsx.

## 5. DESIGN SYSTEM (single source of truth)

Style: mostly black and white. Color is used ONLY for grade and subject chips
and for error states.

### 5.1 Theme tokens (constants/Colors.ts)

Light: background #FFFFFF, card #FFFFFF, border #E4E4E7, text #0A0A0A,
muted #52525B, subtleBg #F4F4F5, hoverBorder #A1A1AA
Dark: background #09090B, card #111113, border #27272A, text #FAFAFA,
muted #A1A1AA, subtleBg #18181B, hoverBorder #52525B
Radius: card 20, avatar 16, button 12, pill 999. Card padding 20.

### 5.2 Grade chips (filled pill, bold 13px, no border)

Light: A/L bg #EDE9FE text #4C1D95 | O/L bg #D9F4EC text #065F46 |
Grade 6-9 bg #FDEBC8 text #7A4400
Dark: A/L bg #2E1F5E text #C4B5FD | O/L bg #0F3B2E text #6EE7B7 |
Grade 6-9 bg #4A2E08 text #FCD34D
Normalize the label before lookup (lowercase, remove spaces, "/", "-" and the
word "grade"), so "AL", "A/L" and "Grade 6-9" all resolve. Unknown grades
use the neutral chip (subtleBg, text color).

### 5.3 Subject chips (outlined pill, medium 13px, colored TEXT only)

Light: white background, 1px border #E4E4E7. Dark: transparent, border #3F3F46.
Text color per subject:
English light #BE123C dark #FB7185
Maths light #1D4ED8 dark #60A5FA
Add Science (emerald), History (amber), ICT (cyan) with similar brightness.
Unknown subjects use the default text color. Keep every lookup in
constants/badgeStyles.ts only.

### 5.4 Error style

Inline field error: small (12-13px), medium weight, red (#DC2626 light,
#F87171 dark), shown under the field; the input border also turns red.
No icon, no heavy box. Form-level errors use a soft tinted box
(red-50 background and red-200 border in light, red/10 and red/30 in dark).
Component: components/ui/FieldError.tsx.

### 5.5 Dropdowns and pickers

Never show a very long list. Filter pickers open in a bottom sheet with a
maximum height of about 50% of the screen, scrolling inside. Short lists stay
compact.

## 6. SCREENS AND COMPONENT SPECS

### 6.1 Bottom bar (app/(tabs)/\_layout.tsx)

Four tabs in this order: Home (house), Messages (message-circle),
Voice Room (mic), Profile (user). Active icon and label use the text color,
inactive use muted. Background follows the theme, with a 1px top border.

### 6.2 Home (app/(tabs)/index.tsx)

- Top: SegmentedControl "Teachers | Feed | Papers". It spans the FULL width of
  the screen on every device size (tabs share the width equally).
- Teachers and Papers show the FilterBar under it. Feed has none.
- Content below switches with the selected tab, and the selected tab is kept in
  the UI store.

### 6.3 FilterBar

- Horizontal scrolling row of pills (no scrollbar): search toggle (icon only),
  Grade, Subject, Medium, Location (Location on Teachers only).
- Inactive pill: card background, 1px border, muted text, chevron.
  Active pill (a value is selected): solid black (white in dark theme) with
  inverted text, and shows the selected value.
- Subject is disabled until a Grade is chosen (reduced opacity).
- Picking a grade clears the chosen subject.
- A clear-all (X) button appears at the end when any filter is active.
- Search toggle reveals a debounced (300ms) search input below the row.
- Pickers open in a bottom sheet (see 5.5). Subjects can be grouped by stream
  with section headers.

### 6.4 TeacherCard (components/teachers/TeacherCard.tsx)

The whole card is pressable and opens teachers/[teacherId]. Layout: avatar on
the left, content on the right. Content order, top to bottom:

1. Name: bold, 20px, tight letter-spacing.
2. Location(s): muted 14px with a small pin icon.
3. Grade chips and subject chips (wrapping row, gap 8). No "Grades" or
   "Subjects" labels. They are told apart by style only.
   Avatar: 72px, radius 16. Fallback is initials on foreground-color background
   (black in light theme, white in dark theme, text inverted). If the teacher is
   verified, a small check badge sits at the bottom-right corner using the same
   foreground/background colors and a ring that matches the card background.
   Pressed state: slight scale (0.98) and a darker border. No "View profile"
   button. Cards in a FlatList with infinite scroll and a "N teachers found"
   count line above.

### 6.5 Teacher profile (app/teachers/[teacherId].tsx)

Header with back button. Reuses the same name / location / grade-chip /
subject-chip block and styles as TeacherCard (bigger name, 24px). Below it:
about, qualifications, classes, as simple sections with Cards. Use mock data.

### 6.6 Feed tab

Vertical list of FeedPostCard (author row, text, optional images, timestamp).
Infinite scroll. Loading, empty and error states use EmptyState and FieldError
styles.

### 6.7 Papers tab

Simple list of PaperItem cards (title, subject chip, grade chip, year, a
download/open button). Pagination via infinite scroll.

### 6.8 Messages (app/(tabs)/messages.tsx)

ConversationList: avatar, name, last message preview, time, unread dot.
Tapping opens chat/[conversationId] as a full-screen stack route (the bottom
bar is hidden). Chat: bubbles (mine on the right in foreground color with
inverted text, theirs on the left in subtleBg), a composer docked at the
bottom that moves above the keyboard.

### 6.9 Voice Room (app/(tabs)/voice-room.tsx)

PLACEHOLDER ONLY. Centered EmptyState: mic icon, title "Voice rooms",
subtitle "Coming soon". No hooks, services or types. Leave
components/voice-room/ empty. This is a future feature, so do not design its
internals.

### 6.10 Profile (app/(tabs)/profile.tsx)

ProfileHeader (avatar, name, email) and ProfileSettings list: theme (system /
light / dark), notifications placeholder, sign out placeholder (no real
action). Add `// TODO(auth)`.

## 7. MOCK DATA AND SWAPPABLE SERVICES

- Each file in services/ exports async functions with realistic signatures,
  for example getTeachers(filters, page) returning
  { teachers, totalCount, nextPage }.
- Right now they return mock data from a local file after a short
  artificial delay (about 300-600ms) to exercise loading states.
- Hooks (React Query) call only these functions, never mock files directly.
- Mock data must cover: several grades (A/L, O/L, Grade 6-9), several subjects,
  multiple locations, verified and unverified teachers, teachers with and
  without avatars, long names, many chips (to test wrapping).
- When the real backend is connected, only the inside of services/\*.ts
  changes. Types in types/ mirror the web app's contracts.

## 8. STATES AND UX DETAILS

Every list and screen needs: loading (skeleton or spinner), empty (EmptyState
with a helpful message), error (message plus a retry button) and
pull-to-refresh. Use consistent 16px screen horizontal padding, safe-area
insets on all screens, and subtle haptics on tab and filter presses if
available.

## 9. BUILD ORDER (finish and show each step before the next)

1. constants/Colors.ts, constants/badgeStyles.ts, store/uiStore.ts, useTheme
2. components/ui/\* (Avatar, Badge, Button, Card, Input, SegmentedControl,
   FieldError, EmptyState)
3. Bottom bar with four placeholder screens (Voice Room final)
4. Mock services + types + hooks
5. Home: HomeTabs, TeacherCard, TeachersTab, then FilterBar
6. Teacher profile screen
7. Profile tab
8. Messages list and chat
9. Feed and Papers tabs
10. Polish: states, accessibility, dark-theme pass on every screen

## 10. DEFINITION OF DONE

- Every screen looks correct in light AND dark theme.
- No hard-coded colors outside constants/.
- Grade and subject chips look the same everywhere they appear.
- The tab bar and the Home segmented control behave as specified.
- Nothing depends on authentication or a real backend.
- TypeScript compiles with no errors and no unused code or files.
