import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type SegmentedControlProps = {
  options: string[];
  active: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({
  options,
  active,
  onChange,
}: SegmentedControlProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.subtleBg, borderColor: palette.border },
      ]}
    >
      {options.map((option) => {
        const isActive = option === active;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.option,
              {
                backgroundColor: isActive
                  ? palette.foreground
                  : "transparent",
                borderColor: isActive ? "transparent" : palette.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? palette.onForeground : palette.text,
                },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    width: "100%",
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 10,
    minHeight: 44,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
