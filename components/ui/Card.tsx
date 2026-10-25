import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type CardProps = {
  children: ReactNode;
  style?: object;
  padding?: number;
};

export function Card({ children, style, padding = 20 }: CardProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border, padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
  },
});
