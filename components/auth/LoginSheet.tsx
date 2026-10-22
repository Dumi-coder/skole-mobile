import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { Text } from "@/components/Themed";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useAuth } from "@/providers/auth-provider";

type LoginSheetProps = {
  /** Screen title shown above the login prompt. */
  title: string;
};

/**
 * Full-screen login prompt rendered in place of a protected screen's content.
 * Shows a "Continue with Google" button and any error in the project's
 * FieldError style.
 */
export function LoginSheet({ title }: LoginSheetProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const { signInWithGoogle, refetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else {
        await refetch();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.heading]}>Sign in to continue</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Sign in with your Google account to access this feature.
          </Text>

          <FieldError message={error ?? undefined} variant="form" />

          <GoogleButton onPress={handlePress} loading={loading} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
