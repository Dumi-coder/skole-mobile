import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeTabs } from "@/components/home/HomeTabs";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const headerTextColor = scheme === "dark" ? "#FFFFFF" : "#000000";

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: headerTextColor }]}>
          sKole
        </Text>
      </View>
      <HomeTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});
