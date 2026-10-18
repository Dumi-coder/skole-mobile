import { useMemo } from "react";

import { useColorScheme } from "@/components/useColorScheme";
import { useUIStore } from "@/store/uiStore";

export function useTheme() {
  const scheme = useColorScheme();
  const themeMode = useUIStore((state) => state.themeMode);

  return useMemo(() => {
    const resolved = themeMode === "system" ? scheme : themeMode;

    return {
      mode: resolved,
      isDark: resolved === "dark",
      scheme,
      themeMode,
    };
  }, [scheme, themeMode]);
}
