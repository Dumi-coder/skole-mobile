import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { LEGAL_LINKS } from "@/constants/legal";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/providers/auth-provider";

export default function OnboardingLoginScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isFromProfile = from === "profile";

  const { markDone } = useOnboarding();
  const { signInWithGoogle, user, refetch } = useAuth();

  useEffect(() => {
    if (user) {
      markDone().then(() => {
        router.replace("/(tabs)");
      });
    }
  }, [user, markDone]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        // Suppress browser cancellation / dismiss noise
        if (!/cancel|dismiss|closed/i.test(result.error)) {
          setError(result.error);
        }
      } else {
        await refetch();
        await markDone();
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.";
      if (!/cancel|dismiss|closed/i.test(message)) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, refetch, markDone]);

  const handleGuestContinue = useCallback(async () => {
    await markDone();
    router.replace("/(tabs)");
  }, [markDone]);

  const handleOpenTerms = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync(LEGAL_LINKS.terms);
    } catch {
      // Ignore in unsupported environments
    }
  }, []);

  const handleOpenPrivacy = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync(LEGAL_LINKS.privacy);
    } catch {
      // Ignore in unsupported environments
    }
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Top Bar with optional Back button if opened from Profile */}
      <View style={styles.topBar}>
        {isFromProfile ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <SymbolView
              name={{
                ios: "chevron.left",
                android: "arrow_back",
                web: "arrow_back",
              }}
              tintColor={palette.text}
              size={20}
            />
            <Text style={[styles.backText, { color: palette.text }]}>Back</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Large Bold Heading and Subtext */}
        <View style={styles.headerSection}>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            style={[styles.title, { color: palette.text }]}
          >
            {"Welcome to\nsKole"}
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Sign in or create your account in one tap. Chat with teachers, save
            favorites and manage your profile.
          </Text>
        </View>

        {/* Action Buttons & Error Message */}
        <View style={styles.actionsSection}>
          <FieldError message={error ?? undefined} variant="form" />

          {/* Continue with Google button (54px) */}
          <GoogleButton
            onPress={handleGoogleSignIn}
            loading={loading}
            disabled={loading}
          />

          {/* Browse teachers as guest button (54px, hidden when opened from Profile) */}
          {!isFromProfile && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Browse teachers as guest"
              onPress={handleGuestContinue}
              style={({ pressed }) => [
                styles.guestButton,
                {
                  backgroundColor: palette.subtleBg,
                  borderColor: palette.border,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.guestButtonText, { color: palette.text }]}>
                Browse teachers as guest
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Footer Legal Section */}
      <View style={styles.footerSection}>
        <Text style={[styles.footerText, { color: palette.muted }]}>
          By continuing you agree to our{" "}
          <Text
            accessibilityRole="link"
            accessibilityLabel="Terms of Service"
            onPress={handleOpenTerms}
            style={[styles.footerLink, { color: palette.text }]}
          >
            Terms
          </Text>{" "}
          and{" "}
          <Text
            accessibilityRole="link"
            accessibilityLabel="Privacy Policy"
            onPress={handleOpenPrivacy}
            style={[styles.footerLink, { color: palette.text }]}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  topBar: {
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    minWidth: 44,
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 44,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1.2,
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 18,
    letterSpacing: -0.2,
  },
  actionsSection: {
    gap: 14,
  },
  guestButton: {
    height: 54,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  footerSection: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
