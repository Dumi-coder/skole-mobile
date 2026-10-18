import { SymbolView } from "expo-symbols";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export default function VoiceRoomScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <View style={styles.centered}>
        <EmptyState
          title="Voice rooms"
          subtitle="Coming soon"
          icon={
            <SymbolView
              name={{ ios: "mic.fill", android: "mic", web: "mic" }}
              tintColor={palette.muted}
              size={36}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});
