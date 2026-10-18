import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { Teacher } from "@/types/teacher";

import { TeacherProfileView } from "./TeacherProfileView";

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View profile for ${teacher.name}`}
      onPress={() =>
        router.push({
          pathname: "/teachers/[teacherId]",
          params: { teacherId: teacher.id },
        })
      }
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: pressed ? palette.hoverBorder : palette.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <TeacherProfileView teacher={teacher} variant="card" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
});
