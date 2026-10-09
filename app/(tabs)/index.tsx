import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type Category = "Teachers" | "Feed" | "Papers";

type TeacherItem = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  medium: string;
  location: string;
};

type FeedItem = {
  id: string;
  author: string;
  avatar: string;
  subjects: string;
  time: string;
  title: string;
  body: string;
};

const teacherItems: TeacherItem[] = [
  {
    id: "t1",
    name: "dumi perera",
    grade: "AL",
    subject: "Maths",
    medium: "English",
    location: "Colombo",
  },
  {
    id: "t2",
    name: "nimal fernando",
    grade: "OL",
    subject: "Physics",
    medium: "Sinhala",
    location: "Kandy",
  },
  {
    id: "t3",
    name: "sajini weerasinghe",
    grade: "A/L",
    subject: "Biology",
    medium: "Tamil",
    location: "Galle",
  },
];

const paperItems = [
  {
    id: "p1",
    title: "2024 Chemistry Paper I",
    grade: "AL",
    subject: "Chemistry",
    medium: "English",
  },
  {
    id: "p2",
    title: "2023 Physics MCQ Set",
    grade: "OL",
    subject: "Physics",
    medium: "Sinhala",
  },
  {
    id: "p3",
    title: "2022 Biology Structured Essay",
    grade: "AL",
    subject: "Biology",
    medium: "Tamil",
  },
];

const feedItems: FeedItem[] = [
  {
    id: "f1",
    author: "dumi perera",
    avatar: "D",
    subjects: "English • OL / AL",
    time: "5d ago",
    title: "who can solve this?",
    body: "Can you solve in 2 minutes?\n\n2a + 2b + 2c = 148, a, b, c = ?",
  },
  {
    id: "f2",
    author: "charith kumara",
    avatar: "C",
    subjects: "Mathematics • Grade 11",
    time: "1h ago",
    title: "Need explanation for quadratic roots",
    body: "I am stuck on factorising x² - 7x + 12. Any quick method?",
  },
];

const teacherOptionSets = {
  grade: ["Grade", "AL", "OL"],
  subject: ["Subject", "Maths", "Physics", "Biology"],
  medium: ["Medium", "English", "Sinhala", "Tamil"],
  location: ["Location", "Colombo", "Kandy", "Galle"],
} as const;

const paperOptionSets = {
  grade: ["Grade", "AL", "OL"],
  subject: ["Subject", "Maths", "Physics", "Biology"],
  medium: ["Medium", "English", "Sinhala", "Tamil"],
} as const;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const [activeCategory, setActiveCategory] = useState<Category>("Teachers");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [teacherFilterState, setTeacherFilterState] = useState({
    grade: "Grade",
    subject: "Subject",
    medium: "Medium",
    location: "Location",
  });
  const [paperFilterState, setPaperFilterState] = useState({
    grade: "Grade",
    subject: "Subject",
    medium: "Medium",
  });

  const categoryOptions = ["Teachers", "Feed", "Papers"] as const;

  const nextValue = (current: string, options: readonly string[]) => {
    const currentIndex = options.indexOf(current);
    const nextIndex =
      currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
    return options[nextIndex];
  };

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return teacherItems.filter((teacher) => {
      const matchesSearch =
        query.length === 0 ||
        [teacher.name, teacher.subject, teacher.location, teacher.medium]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesGrade =
        teacherFilterState.grade === "Grade" ||
        teacher.grade === teacherFilterState.grade;
      const matchesSubject =
        teacherFilterState.subject === "Subject" ||
        teacher.subject === teacherFilterState.subject;
      const matchesMedium =
        teacherFilterState.medium === "Medium" ||
        teacher.medium === teacherFilterState.medium;
      const matchesLocation =
        teacherFilterState.location === "Location" ||
        teacher.location === teacherFilterState.location;

      return (
        matchesSearch &&
        matchesGrade &&
        matchesSubject &&
        matchesMedium &&
        matchesLocation
      );
    });
  }, [searchQuery, teacherFilterState]);

  const filteredPapers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return paperItems.filter((paper) => {
      const matchesSearch =
        query.length === 0 ||
        [paper.title, paper.subject, paper.medium, paper.grade]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesGrade =
        paperFilterState.grade === "Grade" ||
        paper.grade === paperFilterState.grade;
      const matchesSubject =
        paperFilterState.subject === "Subject" ||
        paper.subject === paperFilterState.subject;
      const matchesMedium =
        paperFilterState.medium === "Medium" ||
        paper.medium === paperFilterState.medium;

      return matchesSearch && matchesGrade && matchesSubject && matchesMedium;
    });
  }, [paperFilterState, searchQuery]);

  const handlePressRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  const renderTeacherBar = () => (
    <View>
      <View
        style={[
          styles.filterSearchRow,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search teachers..."
          placeholderTextColor={palette.mutedText}
          style={[styles.filterInput, { color: palette.text }]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {Object.entries(teacherOptionSets).map(([key, options]) => {
          const value =
            teacherFilterState[key as keyof typeof teacherFilterState];
          return (
            <Pressable
              key={key}
              onPress={() =>
                setTeacherFilterState((current) => ({
                  ...current,
                  [key]: nextValue(
                    current[key as keyof typeof current],
                    options,
                  ),
                }))
              }
              style={[
                styles.filterPill,
                { backgroundColor: palette.muted, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.filterText, { color: palette.text }]}>
                {value}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderPaperBar = () => (
    <View>
      <View
        style={[
          styles.filterSearchRow,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search papers..."
          placeholderTextColor={palette.mutedText}
          style={[styles.filterInput, { color: palette.text }]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {Object.entries(paperOptionSets).map(([key, options]) => {
          const value = paperFilterState[key as keyof typeof paperFilterState];
          return (
            <Pressable
              key={key}
              onPress={() =>
                setPaperFilterState((current) => ({
                  ...current,
                  [key]: nextValue(
                    current[key as keyof typeof current],
                    options,
                  ),
                }))
              }
              style={[
                styles.filterPill,
                { backgroundColor: palette.muted, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.filterText, { color: palette.text }]}>
                {value}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handlePressRefresh}
              tintColor={palette.text}
            />
          }
        >
          <View style={styles.headerRow}>
            <Text style={styles.brand}>sKole</Text>
          </View>

          <View
            style={[
              styles.segmentedControl,
              { backgroundColor: palette.muted, borderColor: palette.border },
            ]}
          >
            {categoryOptions.map((category) => {
              const isActive = activeCategory === category;
              return (
                <Pressable
                  key={category}
                  onPress={() => {
                    setActiveCategory(category);
                    setSearchQuery("");
                  }}
                  style={[
                    styles.segment,
                    isActive
                      ? {
                          backgroundColor: palette.text,
                          borderColor: palette.text,
                        }
                      : {
                          backgroundColor: "transparent",
                          borderColor: "transparent",
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: isActive ? palette.background : palette.text },
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {activeCategory === "Teachers" && renderTeacherBar()}
          {activeCategory === "Papers" && renderPaperBar()}

          {activeCategory === "Teachers" && (
            <>
              <Text style={[styles.resultsLabel, { color: palette.mutedText }]}>
                {filteredTeachers.length} teachers found
              </Text>
              {filteredTeachers.map((teacher) => (
                <View
                  key={teacher.id}
                  style={[
                    styles.teacherCard,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.teacherAvatar,
                      { backgroundColor: "#8e7ae6" },
                    ]}
                  >
                    <Text style={styles.teacherAvatarText}>
                      {teacher.name.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.teacherInfo}>
                    <Text style={[styles.teacherName, { color: palette.text }]}>
                      {teacher.name}
                    </Text>
                    <View style={styles.teacherMetaRow}>
                      <Text
                        style={[
                          styles.metaTag,
                          {
                            color: palette.text,
                            backgroundColor: palette.muted,
                          },
                        ]}
                      >
                        {teacher.grade}
                      </Text>
                      <Text
                        style={[
                          styles.metaTag,
                          {
                            color: palette.text,
                            backgroundColor: palette.muted,
                          },
                        ]}
                      >
                        {teacher.subject}
                      </Text>
                      <Text
                        style={[
                          styles.metaTag,
                          {
                            color: palette.text,
                            backgroundColor: palette.muted,
                          },
                        ]}
                      >
                        {teacher.medium}
                      </Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Text style={{ color: palette.mutedText }}>◉</Text>
                      <Text
                        style={[
                          styles.locationText,
                          { color: palette.mutedText },
                        ]}
                      >
                        {teacher.location}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {activeCategory === "Papers" && (
            <>
              <Text style={[styles.resultsLabel, { color: palette.mutedText }]}>
                {filteredPapers.length} papers found
              </Text>
              {filteredPapers.map((paper) => (
                <View
                  key={paper.id}
                  style={[
                    styles.paperCard,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.paperTitle, { color: palette.text }]}>
                    {paper.title}
                  </Text>
                  <View style={styles.teacherMetaRow}>
                    <Text
                      style={[
                        styles.metaTag,
                        { color: palette.text, backgroundColor: palette.muted },
                      ]}
                    >
                      {paper.grade}
                    </Text>
                    <Text
                      style={[
                        styles.metaTag,
                        { color: palette.text, backgroundColor: palette.muted },
                      ]}
                    >
                      {paper.subject}
                    </Text>
                    <Text
                      style={[
                        styles.metaTag,
                        { color: palette.text, backgroundColor: palette.muted },
                      ]}
                    >
                      {paper.medium}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {activeCategory === "Feed" && (
            <View style={styles.feedList}>
              {feedItems.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.feedCard,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.feedHeader}>
                    <View style={styles.feedAuthorRow}>
                      <View
                        style={[
                          styles.feedAvatar,
                          { backgroundColor: "#8e7ae6" },
                        ]}
                      >
                        <Text style={styles.feedAvatarText}>{item.avatar}</Text>
                      </View>
                      <View style={styles.authorInfo}>
                        <Text
                          style={[styles.authorName, { color: palette.text }]}
                        >
                          {item.author}
                        </Text>
                        <Text
                          style={[
                            styles.authorMeta,
                            { color: palette.mutedText },
                          ]}
                        >
                          {item.subjects}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.timeText, { color: palette.mutedText }]}
                    >
                      {item.time}
                    </Text>
                  </View>

                  <Text style={[styles.feedTitle, { color: palette.text }]}>
                    {item.title}
                  </Text>

                  <View
                    style={[
                      styles.feedBody,
                      { backgroundColor: palette.muted },
                    ]}
                  >
                    <Text
                      style={[styles.feedBodyText, { color: palette.text }]}
                    >
                      {item.body}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  brand: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#111827",
  },
  segmentedControl: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
  },
  segmentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  filterSearchRow: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
    minHeight: 42,
  },
  filterInput: {
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 0,
  },
  filterRow: {
    paddingBottom: 12,
    gap: 8,
  },
  filterPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    minHeight: 38,
    justifyContent: "center",
  },
  filterText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  resultsLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
  },
  teacherCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  teacherAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  teacherAvatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "lowercase",
  },
  teacherMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  metaTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  paperCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  paperTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  feedList: {
    gap: 16,
  },
  feedCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  feedAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  feedAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  feedAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "lowercase",
  },
  authorMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  timeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  feedTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  feedBody: {
    borderRadius: 12,
    padding: 16,
  },
  feedBodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
