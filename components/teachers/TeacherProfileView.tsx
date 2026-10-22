import { StyleSheet, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { Text } from "@/components/Themed";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  formatTeacherLocations,
  getTeacherInitials,
} from "@/lib/teacherDisplay";
import type { Teacher } from "@/types/teacher";

type TeacherProfileViewProps = {
  teacher: Teacher;
  variant?: "card" | "profile";
  showAvatar?: boolean;
};

export function TeacherProfileView({
  teacher,
  variant = "card",
  showAvatar = true,
}: TeacherProfileViewProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const nameSize = variant === "profile" ? 24 : 20;

  return (
    <View style={showAvatar ? styles.row : undefined}>
      {showAvatar ? (
        <Avatar
          label={getTeacherInitials(teacher)}
          imageUrl={
            teacher.imageUrl ??
            (teacher.avatar?.startsWith("http") ? teacher.avatar : null)
          }
          verified={teacher.verified}
        />
      ) : null}
      <View style={[styles.content, !showAvatar && styles.contentFull]}>
        <Text
          style={[
            styles.name,
            { fontSize: nameSize, lineHeight: nameSize + 4 },
          ]}
        >
          {teacher.name}
        </Text>
        <View style={styles.metaRow}>
          <SymbolView
            name={{
              ios: "mappin.and.ellipse",
              android: "location_on",
              web: "location_on",
            }}
            tintColor={palette.muted}
            size={14}
          />
          <Text style={[styles.location, { color: palette.muted }]}>
            {formatTeacherLocations(teacher.locations)}
          </Text>
        </View>
        <View style={styles.chipRow}>
          {teacher.grades.map((grade) => (
            <Badge key={grade} label={grade} kind="grade" />
          ))}
          {teacher.subjects.map((subject) => (
            <Badge key={subject} label={subject} kind="subject" />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  content: {
    flex: 1,
  },
  contentFull: {
    width: "100%",
  },
  name: {
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    flexShrink: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
