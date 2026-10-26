import { StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type ProfileAvatarProps = {
  name: string | null | undefined;
  size?: number;
  avatarUrl?: string | null;
};

const AVATAR_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
];

export function ProfileAvatar({ name, size = 44 }: ProfileAvatarProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  const displayName = name?.trim() || "User";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  // Deterministic color based on name
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  const backgroundColor = AVATAR_COLORS[colorIndex];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor: palette.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: Math.round(size * 0.4),
            lineHeight: Math.round(size * 0.48),
          },
        ]}
      >
        {initials || "U"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
