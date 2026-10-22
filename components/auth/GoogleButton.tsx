import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type GoogleButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const googleLogoUri =
  "https://developers.google.com/identity/images/g-logo.png";

export function GoogleButton({
  onPress,
  loading = false,
  disabled = false,
  style,
}: GoogleButtonProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={loading ? "Signing in" : "Continue with Google"}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: palette.border,
          backgroundColor: palette.card,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: googleLogoUri }}
        style={styles.logo}
        accessibilityIgnoresInvertColors
      />
      <Text style={[styles.label, { color: palette.text }]}>
        {loading ? "Signing in…" : "Continue with Google"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  logo: {
    width: 20,
    height: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
