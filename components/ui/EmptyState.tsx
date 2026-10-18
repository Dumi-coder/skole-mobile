import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, subtitle, icon }: EmptyStateProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      {icon ? (
        <View style={styles.iconWrap}>{icon}</View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 180,
  },
  iconWrap: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
