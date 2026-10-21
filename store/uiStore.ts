import { create } from "zustand";

export type ThemeMode = "system" | "light" | "dark";
export type HomeTab = "teachers" | "feed" | "papers";

export type HomeFilters = {
  grade?: string;
  subject?: string;
  medium?: string;
  location?: string;
  search?: string;
};

type UIStore = {
  themeMode: ThemeMode;
  selectedHomeTab: HomeTab;
  filters: HomeFilters;
  searchOpen: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setSelectedHomeTab: (tab: HomeTab) => void;
  setFilters: (filters: Partial<HomeFilters>) => void;
  clearFilters: () => void;
  setSearchOpen: (open: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  themeMode: "system",
  selectedHomeTab: "teachers",
  filters: {},
  searchOpen: false,
  setThemeMode: (mode) => set({ themeMode: mode }),
  setSelectedHomeTab: (tab) => set({ selectedHomeTab: tab }),
  setFilters: (partial) =>
    set((state) => {
      const next = { ...state.filters, ...partial };
      if (
        "grade" in partial &&
        partial.grade !== state.filters.grade &&
        partial.subject === undefined
      ) {
        next.subject = undefined;
      }
      return { filters: next };
    }),
  clearFilters: () => set({ filters: {}, searchOpen: false }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
