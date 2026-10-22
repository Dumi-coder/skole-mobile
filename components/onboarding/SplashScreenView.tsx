import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/Colors";

export function SplashScreenView() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Center content: Wordmark and Tagline */}
      <View style={styles.centerContent} accessibilityRole="header">
        <Text style={styles.wordmark} accessibilityLabel="sKole">
          sKole
        </Text>
        <Text style={styles.tagline}>Find the right tutor, fast</Text>
      </View>

      {/* Footer text */}
      <View
        style={[
          styles.footerContainer,
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
      >
        <Text style={styles.footerText}>
          {"Sri Lanka's tutor marketplace"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.splash.background,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  wordmark: {
    color: Colors.splash.text,
    fontSize: 56,
    fontWeight: "700",
    letterSpacing: -1.5,
    textAlign: "center",
  },
  tagline: {
    color: Colors.splash.text,
    fontSize: 16,
    fontWeight: "400",
    marginTop: 14,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  footerText: {
    color: Colors.splash.footer,
    fontSize: 13,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: -0.1,
  },
});

export default SplashScreenView;
