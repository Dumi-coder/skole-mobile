import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useUIStore, type ThemeMode } from "@/store/uiStore";

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export function ProfileSettings() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);

  const activeThemeLabel =
    themeOptions.find((option) => option.value === themeMode)?.label ??
    "System";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <Text style={styles.title}>Preferences</Text>

      <View style={styles.block}>
        <Text style={styles.label}>Theme</Text>
        <SegmentedControl
          options={themeOptions.map((option) => option.label)}
          active={activeThemeLabel}
          onChange={(label) => {
            const match = themeOptions.find((option) => option.label === label);
            if (match) setThemeMode(match.value);
          }}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications settings placeholder"
        style={[styles.item, { borderBottomColor: palette.border }]}
      >
        <Text>Notifications</Text>
        <Text style={[styles.hint, { color: palette.muted }]}>Enabled</Text>
      </Pressable>

      {/* TODO(auth): Sign out action will plug in here */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out placeholder"
        style={styles.itemLast}
      >
        <Text>Sign out</Text>
        <Text style={[styles.hint, { color: palette.muted }]}>Placeholder</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  block: {
    marginBottom: 16,
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  item: {
    paddingVertical: 12,
    minHeight: 44,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemLast: {
    paddingVertical: 12,
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hint: {
    fontSize: 13,
  },
});
