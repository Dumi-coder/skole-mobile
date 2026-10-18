import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { queryClient } from "@/lib/queryClient";
import { useUIStore } from "@/store/uiStore";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const themeMode = useUIStore((state) => state.themeMode);

  const resolvedTheme =
    themeMode === "system"
      ? colorScheme === "dark"
        ? DarkTheme
        : DefaultTheme
      : themeMode === "dark"
        ? DarkTheme
        : DefaultTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={resolvedTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="teachers/[teacherId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="chat/[conversationId]"
            options={{ headerShown: false }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
