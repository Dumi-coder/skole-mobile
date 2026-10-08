import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

const categories = ["Teacher", "Feed", "Papers"] as const;
type Category = (typeof categories)[number];

const teacherHighlights = [
  {
    title: "Dr. Emma Cole",
    subtitle: "Data Science mentor",
    meta: "4.9 rating · 12 live classes",
    tag: "Top",
  },
  {
    title: "Prof. Nolan Reed",
    subtitle: "Research writing coach",
    meta: "4.8 rating · 8 office hours",
    tag: "Popular",
  },
  {
    title: "Aisha Morgan",
    subtitle: "Career readiness expert",
    meta: "4.7 rating · 6 workshops",
    tag: "New",
  },
];

const feedHighlights = [
  {
    title: "Classroom challenge",
    subtitle: "Community review sprint is live this week.",
    meta: "6.3k learners",
    tag: "Trending",
  },
  {
    title: "Mentor AMA",
    subtitle: "Ask your questions about internships and projects.",
    meta: "Live now",
    tag: "Live",
  },
  {
    title: "Peer wins",
    subtitle: "See how students are building standout portfolios.",
    meta: "Fresh updates",
    tag: "Daily",
  },
];

const paperHighlights = [
  {
    title: "AI for collaborative learning",
    subtitle: "New frameworks for research and peer review.",
    meta: "New paper",
    tag: "New",
  },
  {
    title: "Practical neuroscience",
    subtitle: "Evidence-based field notes for applied study.",
    meta: "Most read",
    tag: "Popular",
  },
  {
    title: "Designing better feedback loops",
    subtitle: "How feedback systems improve retention and clarity.",
    meta: "Curated",
    tag: "Curated",
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const [activeCategory, setActiveCategory] = useState<Category>("Teacher");

  const listData = useMemo(() => {
    switch (activeCategory) {
      case "Feed":
        return feedHighlights;
      case "Papers":
        return paperHighlights;
      default:
        return teacherHighlights;
    }
  }, [activeCategory]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <Text style={styles.brand}>sKole</Text>
          <Pressable
            style={[
              styles.filterButton,
              { backgroundColor: palette.muted, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.filterText, { color: palette.text }]}>
              Today
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.segmentedControl,
            { backgroundColor: palette.muted, borderColor: palette.border },
          ]}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[
                  styles.segment,
                  isActive
                    ? {
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                        shadowColor: "#000000",
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                      }
                    : { backgroundColor: "transparent" },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: isActive ? palette.text : palette.mutedText },
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.heroCard,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.heroLabel, { color: palette.mutedText }]}>
            Featured
          </Text>
          <Text style={styles.heroTitle}>Design a smarter study rhythm.</Text>
          <Text style={[styles.heroDescription, { color: palette.mutedText }]}>
            Discover sessions, conversations, and research tailored to your
            learning path.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeCategory}</Text>
          <Text style={[styles.sectionLink, { color: palette.mutedText }]}>
            View all
          </Text>
        </View>

        {listData.map((item) => (
          <Pressable
            key={item.title}
            style={[
              styles.listCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: palette.muted }]}>
              <Text style={[styles.avatarText, { color: palette.text }]}>
                {item.title.slice(0, 1).toUpperCase()}
              </Text>
            </View>

            <View style={styles.listContent}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={[styles.listSubtitle, { color: palette.mutedText }]}>
                {item.subtitle}
              </Text>
              <Text style={[styles.listMeta, { color: palette.mutedText }]}>
                {item.meta}
              </Text>
            </View>

            <Text
              style={[
                styles.pill,
                { backgroundColor: palette.muted, color: palette.text },
              ]}
            >
              {item.tag}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  brand: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  filterButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  segmentedControl: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 2,
  },
  segmentText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  sectionLink: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  listTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    marginBottom: 2,
    flexShrink: 1,
  },
  listSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },
  listMeta: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    marginLeft: 6,
    alignSelf: "center",
    textAlign: "center",
  },
});
