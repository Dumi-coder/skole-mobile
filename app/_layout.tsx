import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  router,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { SplashScreenView } from "@/components/onboarding/SplashScreenView";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useOnboarding } from "@/hooks/useOnboarding";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
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

  if (!loaded) {
    return <SplashScreenView />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNavInner />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const SPLASH_MIN_DURATION_MS = 1200;
const SPLASH_MAX_DURATION_MS = 3000;
const SPLASH_FADE_DURATION_MS = 250;

type SplashStage = "waiting" | "fading" | "finished";

function RootLayoutNavInner() {
  const { user, isLoading: authLoading } = useAuth();
  const { done: onboardingDone, isLoading: onboardingLoading } = useOnboarding();

  const [stage, setStage] = useState<SplashStage>("waiting");
  const [destination, setDestination] = useState<string | null>(null);

  const splashOpacity = useSharedValue(1);

  // Keep latest user & onboardingDone in ref for async timer callbacks
  const authStateRef = useRef({ user, onboardingDone });
  useEffect(() => {
    authStateRef.current = { user, onboardingDone };
  }, [user, onboardingDone]);

  const triggerTransition = useCallback(() => {
    setStage((prev) => {
      if (prev !== "waiting") return prev;
      const { user: currentUser, onboardingDone: currentDone } = authStateRef.current;
      const target = currentUser != null || currentDone ? "/(tabs)" : "/(onboarding)/welcome";
      setDestination(target);
      return "fading";
    });
  }, []);

  const minTimerFiredRef = useRef(false);
  const dataReadyRef = useRef(false);

  // Hide the native splash screen as soon as React splash view mounts
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Minimum 1200ms display timer and 3000ms safety timeout
  useEffect(() => {
    const minTimer = setTimeout(() => {
      minTimerFiredRef.current = true;
      if (dataReadyRef.current) {
        triggerTransition();
      }
    }, SPLASH_MIN_DURATION_MS);

    const maxTimer = setTimeout(() => {
      triggerTransition();
    }, SPLASH_MAX_DURATION_MS);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [triggerTransition]);

  // When data loading completes
  useEffect(() => {
    if (!authLoading && !onboardingLoading) {
      dataReadyRef.current = true;
      if (minTimerFiredRef.current) {
        const timer = setTimeout(triggerTransition, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, onboardingLoading, triggerTransition]);

  // Navigate and trigger the 250ms reanimated fade out
  useEffect(() => {
    if (stage === "fading" && destination) {
      router.replace(destination as any);
      splashOpacity.value = withTiming(0, { duration: SPLASH_FADE_DURATION_MS }, (finished) => {
        if (finished) {
          runOnJS(setStage)("finished");
        }
      });
    }
  }, [stage, destination, splashOpacity]);

  const animatedSplashStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  // Never render tabs or welcome before the decision is made
  if (stage === "waiting") {
    return <SplashScreenView />;
  }

  return (
    <View style={styles.container}>
      <RootLayoutNav />
      {stage === "fading" && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, animatedSplashStyle]}
        >
          <SplashScreenView />
        </Animated.View>
      )}
    </View>
  );
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
    <ThemeProvider value={resolvedTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.splash.background,
  },
});
