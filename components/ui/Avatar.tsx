import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type AvatarProps = {
  label: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  verified?: boolean;
  children?: ReactNode;
};

export function Avatar({
  label,
  size = 72,
  backgroundColor,
  textColor,
  verified = false,
  children,
}: AvatarProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.22,
          backgroundColor: backgroundColor ?? palette.foreground,
        },
      ]}
    >
      {children ?? (
        <Text
          style={[
            styles.text,
            {
              color: textColor ?? palette.onForeground,
              fontSize: Math.max(14, size * 0.32),
            },
          ]}
        >
          {label}
        </Text>
      )}
      {verified ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: palette.card, borderColor: palette.card },
          ]}
        >
          <View
            style={[
              styles.badgeInner,
              { backgroundColor: palette.verified },
            ]}
          >
            <Text style={[styles.badgeText, { color: "#FFFFFF" }]}>
              ✓
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
