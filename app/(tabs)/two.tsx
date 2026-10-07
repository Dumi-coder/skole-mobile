import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text, View } from '@/components/Themed';
import { apiClient } from '@/services/api';

export default function CourseScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const [courses, setCourses] = useState<{ id: string; name: string; teacherName: string; subject: string | null; grade: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      try {
        const payload = await apiClient.getFeatured(5);
        if (!active) {
          return;
        }

        setCourses(
          payload.classes.map((item) => ({
            id: item.id,
            name: item.name,
            teacherName: item.teacherName,
            subject: item.subject,
            grade: item.grade,
          })),
        );
      } catch {
        if (active) {
          setCourses([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCourses();
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Course library</Text>
        <Text style={[styles.pill, { backgroundColor: palette.muted, color: palette.mutedText }]}>{loading ? 'Loading...' : `${courses.length} items`}</Text>
      </View>

      {!loading && courses.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={styles.emptyTitle}>No courses yet</Text>
          <Text style={[styles.emptyText, { color: palette.mutedText }]}>Your course list will appear here once data is available.</Text>
        </View>
      ) : null}

      {courses.map((course) => (
        <View key={course.id} style={[styles.courseCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={styles.courseTitle}>{course.name}</Text>
          <Text style={[styles.courseMeta, { color: palette.mutedText }]}>{course.teacherName}</Text>
          <Text style={[styles.courseMeta, { color: palette.mutedText }]}>{course.subject ?? 'Subject pending'} · {course.grade ?? 'Grade pending'}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  courseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
  },
  courseTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  courseMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
});
