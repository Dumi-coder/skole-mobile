import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import {
  getGradeStyle,
  getSubjectStyle,
} from "@/constants/badgeStyles";
import Colors from "@/constants/Colors";

type BadgeProps = {
  label: string;
  kind?: "grade" | "subject";
  tone?: "light" | "dark";
};

export function Badge({ label, kind = "grade", tone }: BadgeProps) {
  const scheme = useColorScheme();
  const resolvedTone = tone ?? scheme;
  const palette = Colors[resolvedTone];

  if (kind === "grade") {
    const style = getGradeStyle(resolvedTone, label);
    return (
      <View
        style={[
          styles.gradeBadge,
          { backgroundColor: style.bg, borderRadius: 999 },
        ]}
      >
        <Text style={[styles.gradeText, { color: style.text }]}>
          {label || "Other"}
        </Text>
      </View>
    );
  }

  const style = getSubjectStyle(resolvedTone, label);
  return (
    <View
      style={[
        styles.subjectBadge,
        {
          borderColor: style.border,
          borderRadius: 999,
          backgroundColor:
            resolvedTone === "light" ? palette.card : "transparent",
        },
      ]}
    >
      <Text style={[styles.subjectText, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  gradeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  subjectBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  subjectText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
