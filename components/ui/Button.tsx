import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  icon,
  accessibilityLabel,
}: ButtonProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  const background =
    variant === "primary"
      ? palette.foreground
      : variant === "secondary"
        ? palette.subtleBg
        : "transparent";

  const textColor =
    variant === "primary" ? palette.onForeground : palette.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          borderColor: palette.border,
          borderWidth: variant === "ghost" ? 1 : 0,
          width: fullWidth ? "100%" : "auto",
        },
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
