import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { signInWithEmail, signInWithGoogle } from "@/services/api";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "mobile",
    path: "/",
  });

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
  });

  const handleContinue = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signInWithEmail(trimmedEmail, trimmedPassword);
      Alert.alert(
        "Signed in",
        "Your session is now linked to the shared Fastify backend.",
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Sign in failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleClientId) {
      setError(
        "Google sign-in is not configured. Add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your Expo env file.",
      );
      return;
    }

    if (!request) {
      setError(
        "Google auth is still initializing. Please try again in a moment.",
      );
      return;
    }

    setError(null);
    setGoogleSubmitting(true);

    try {
      const result = await promptAsync();
      if (result.type !== "success" || !result.params?.id_token) {
        setError("Google sign-in was cancelled or failed.");
        return;
      }

      await signInWithGoogle(result.params.id_token);
      Alert.alert(
        "Signed in with Google",
        "Your Google session is now linked to the shared Fastify backend.",
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Google sign-in failed.";
      setError(message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Skole mobile sync</Text>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue.</Text>
      </View>

      <View
        style={[
          styles.formCard,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        <Pressable
          onPress={handleGoogleLogin}
          disabled={googleSubmitting}
          style={({ pressed }) => [
            styles.googleButton,
            {
              backgroundColor: "#ffffff",
              borderColor: palette.border,
              opacity: pressed || googleSubmitting ? 0.9 : 1,
            },
          ]}
        >
          <Text style={styles.googleBadge}>G</Text>
          <Text style={[styles.googleButtonText, { color: palette.text }]}>
            {googleSubmitting
              ? "Connecting to Google..."
              : "Continue with Google"}
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View
            style={[styles.dividerLine, { backgroundColor: palette.border }]}
          />
          <Text style={[styles.dividerText, { color: palette.mutedText }]}>
            or
          </Text>
          <View
            style={[styles.dividerLine, { backgroundColor: palette.border }]}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Enter your email"
          placeholderTextColor={palette.mutedText}
          style={[
            styles.input,
            {
              backgroundColor: palette.muted,
              color: palette.text,
              borderColor: palette.border,
            },
          ]}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor={palette.mutedText}
          secureTextEntry
          style={[
            styles.input,
            {
              backgroundColor: palette.muted,
              color: palette.text,
              borderColor: palette.border,
            },
          ]}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          onPress={handleContinue}
          disabled={submitting}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: palette.tint,
              opacity: pressed || submitting ? 0.9 : 1,
            },
          ]}
        >
          <Text
            style={[styles.primaryButtonText, { color: palette.background }]}
          >
            {submitting ? "Signing in..." : "Continue"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  heroCard: {
    marginBottom: 16,
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#0f1419",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#9aa4ae",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: "#ffffff",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#dfe5eb",
  },
  formCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 12,
  },
  googleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "700",
    backgroundColor: "#0f1419",
    color: "#ffffff",
    fontSize: 12,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dividerLine: {
    height: 1,
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  label: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: "#d04545",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
});
