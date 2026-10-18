import type { ColorSchemeName } from "react-native";
import { useColorScheme as useColorSchemeCore } from "react-native";

import { useUIStore } from "@/store/uiStore";

function resolveSystemScheme(
  coreScheme: ColorSchemeName,
): "light" | "dark" {
  if (coreScheme === "dark") return "dark";
  return "light";
}

export const useColorScheme = (): "light" | "dark" => {
  const coreScheme = useColorSchemeCore();
  const themeMode = useUIStore((state) => state.themeMode);

  if (themeMode === "light" || themeMode === "dark") {
    return themeMode;
  }

  return resolveSystemScheme(coreScheme);
};
