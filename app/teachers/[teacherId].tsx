import { SymbolView } from "expo-symbols";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/Themed";
import { TeacherProfileView } from "@/components/teachers/TeacherProfileView";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useTeacher } from "@/hooks/useTeacher";

export default function TeacherProfileScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const teacherQuery = useTeacher(teacherId);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { borderColor: palette.border, backgroundColor: palette.card },
          ]}
        >
          <SymbolView
            name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
            tintColor={palette.text}
            size={20}
          />
        </Pressable>
      </View>

      {teacherQuery.isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.text} />
        </View>
      ) : teacherQuery.isError ? (
        <FieldError
          message="Unable to load this teacher."
          onRetry={() => teacherQuery.refetch()}
        />
      ) : !teacherQuery.data ? (
        <EmptyState
          title="Teacher not found"
          subtitle="This profile may have been removed."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <TeacherProfileView
            teacher={teacherQuery.data}
            variant="profile"
            showAvatar={true}
          />

          <Card>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={[styles.sectionBody, { color: palette.muted }]}>
              {teacherQuery.data.about}
            </Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Qualifications</Text>
            {teacherQuery.data.qualifications.map((item) => (
              <Text
                key={item}
                style={[styles.sectionBody, { color: palette.muted }]}
              >
                {"• "}
                {item}
              </Text>
            ))}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Classes</Text>
            {teacherQuery.data.classes.map((item) => (
              <Text
                key={item}
                style={[styles.sectionBody, { color: palette.muted }]}
              >
                {"• "}
                {item}
              </Text>
            ))}
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerRow: { paddingHorizontal: 16, paddingTop: 12 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
