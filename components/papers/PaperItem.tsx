import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { Badge } from "@/components/ui/Badge";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { Paper } from "@/types/papers";

export function PaperItem({ paper }: { paper: Paper }) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <Text style={styles.title}>{paper.title}</Text>
      <View style={styles.chips}>
        <Badge label={paper.grade} kind="grade" tone={scheme} />
        <Badge label={paper.subject} kind="subject" tone={scheme} />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.meta, { color: palette.muted }]}>
          {paper.year} • {paper.medium}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${paper.title}`}
          style={[styles.button, { backgroundColor: palette.foreground }]}
        >
          <Text style={[styles.buttonText, { color: palette.onForeground }]}>
            Open
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    fontSize: 12,
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    minWidth: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
