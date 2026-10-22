import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import {
  gradePalette,
  subjectPalette,
} from "@/constants/badgeStyles";
import Colors from "@/constants/Colors";
import { ONBOARDING_SLIDES } from "@/constants/onboarding";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const isSmallScreen = height < 700;
  const illustrationHeight = isSmallScreen ? 220 : 290;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [width],
  );

  const handleSkip = useCallback(() => {
    router.replace("/(onboarding)/login" as any);
  }, []);

  const handleNext = useCallback(() => {
    if (activeIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    } else {
      router.replace("/(onboarding)/login" as any);
    }
  }, [activeIndex]);

  const renderSlideArt = (index: number) => {
    if (index === 0) {
      // Slide 1: Teacher card deck + grade chips
      const alBadge = gradePalette.al[colorScheme];
      const olBadge = gradePalette.ol[colorScheme];
      const g69Badge = gradePalette["grade-6-9"][colorScheme];
      const mathsChip = subjectPalette.maths[colorScheme];

      return (
        <View
          style={[
            styles.backdrop,
            {
              backgroundColor: palette.subtleBg,
              height: illustrationHeight,
            },
          ]}
        >
          {/* Layered Skeleton Card behind */}
          <View
            style={[
              styles.skeletonBackCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.skeletonAvatar,
                { backgroundColor: palette.border },
              ]}
            />
            <View
              style={[
                styles.skeletonBar,
                { backgroundColor: palette.border },
              ]}
            />
          </View>

          {/* Floating Teacher Card on top */}
          <View
            style={[
              styles.floatingCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: palette.primary },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    {
                      color:
                        colorScheme === "dark"
                          ? palette.background
                          : palette.onForeground,
                    },
                  ]}
                >
                  D
                </Text>
              </View>
              <View style={styles.headerInfo}>
                <Text
                  style={[styles.teacherName, { color: palette.text }]}
                  numberOfLines={1}
                >
                  Dumi Perera
                </Text>
                <Text
                  style={[styles.teacherLocation, { color: palette.muted }]}
                  numberOfLines={1}
                >
                  Colombo, Rajagiriya
                </Text>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: alBadge.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: alBadge.text, fontWeight: "600" },
                      ]}
                    >
                      A/L
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.chip,
                      styles.chipOutline,
                      { borderColor: mathsChip.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: mathsChip.text, fontWeight: "500" },
                      ]}
                    >
                      Maths
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Floating Grade Badges below card */}
          <View style={styles.floatingBadgesRow}>
            <View
              style={[
                styles.pillBadge,
                { backgroundColor: olBadge.bg },
              ]}
            >
              <Text
                style={[
                  styles.pillBadgeText,
                  { color: olBadge.text },
                ]}
              >
                O/L
              </Text>
            </View>
            <View
              style={[
                styles.pillBadge,
                { backgroundColor: g69Badge.bg },
              ]}
            >
              <Text
                style={[
                  styles.pillBadgeText,
                  { color: g69Badge.text },
                ]}
              >
                Grade 6–9
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (index === 1) {
      // Slide 2: Two chat bubbles
      return (
        <View
          style={[
            styles.backdrop,
            {
              backgroundColor: palette.subtleBg,
              height: illustrationHeight,
            },
          ]}
        >
          {/* Outgoing student bubble */}
          <View
            style={[
              styles.chatBubbleStudent,
              { backgroundColor: palette.primary },
            ]}
          >
            <Text
              style={[
                styles.chatTextStudent,
                {
                  color:
                    colorScheme === "dark"
                      ? palette.background
                      : palette.onForeground,
                },
              ]}
            >
              Hi! Are you available for O/L Science classes this Saturday?
            </Text>
            <Text
              style={[
                styles.chatTimeStudent,
                {
                  color:
                    colorScheme === "dark"
                      ? palette.background
                      : palette.onForeground,
                },
              ]}
            >
              10:30 AM
            </Text>
          </View>

          {/* Incoming teacher bubble */}
          <View
            style={[
              styles.chatBubbleTeacher,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.teacherChatHeader}>
              <View
                style={[
                  styles.miniAvatar,
                  { backgroundColor: palette.primary },
                ]}
              >
                <Text
                  style={[
                    styles.miniAvatarText,
                    {
                      color:
                        colorScheme === "dark"
                          ? palette.background
                          : palette.onForeground,
                    },
                  ]}
                >
                  D
                </Text>
              </View>
              <Text
                style={[styles.teacherChatName, { color: palette.text }]}
              >
                Dumi Perera
              </Text>
              <Text
                style={[styles.teacherTag, { color: palette.verified }]}
              >
                Teacher
              </Text>
            </View>
            <Text
              style={[styles.chatTextTeacher, { color: palette.text }]}
            >
              {"Yes, 4 PM works great! Let's schedule a session."}
            </Text>
            <Text
              style={[styles.chatTimeTeacher, { color: palette.muted }]}
            >
              10:32 AM
            </Text>
          </View>
        </View>
      );
    }

    // Slide 3: Two past-paper cards with subject chips
    const alBadge = gradePalette.al[colorScheme];
    const olBadge = gradePalette.ol[colorScheme];
    const mathsChip = subjectPalette.maths[colorScheme];
    const scienceChip = subjectPalette.science[colorScheme];

    return (
      <View
        style={[
          styles.backdrop,
          {
            backgroundColor: palette.subtleBg,
            height: illustrationHeight,
          },
        ]}
      >
        {/* Paper Card 1 */}
        <View
          style={[
            styles.paperCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.paperRow}>
            <View
              style={[
                styles.paperIconBox,
                { backgroundColor: palette.subtleBg },
              ]}
            >
              <Text
                style={[styles.paperIconText, { color: palette.danger }]}
              >
                PDF
              </Text>
            </View>
            <View style={styles.paperInfo}>
              <Text
                style={[styles.paperTitle, { color: palette.text }]}
                numberOfLines={1}
              >
                2023 G.C.E. A/L Examination
              </Text>
              <Text
                style={[styles.paperSubtitle, { color: palette.muted }]}
                numberOfLines={1}
              >
                Combined Mathematics • Part I & II
              </Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.chip,
                    styles.chipOutline,
                    { borderColor: mathsChip.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: mathsChip.text, fontWeight: "500" },
                    ]}
                  >
                    Maths
                  </Text>
                </View>
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: alBadge.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: alBadge.text, fontWeight: "600" },
                    ]}
                  >
                    A/L
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Paper Card 2 */}
        <View
          style={[
            styles.paperCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
              marginTop: 10,
            },
          ]}
        >
          <View style={styles.paperRow}>
            <View
              style={[
                styles.paperIconBox,
                { backgroundColor: palette.subtleBg },
              ]}
            >
              <Text
                style={[styles.paperIconText, { color: palette.danger }]}
              >
                PDF
              </Text>
            </View>
            <View style={styles.paperInfo}>
              <Text
                style={[styles.paperTitle, { color: palette.text }]}
                numberOfLines={1}
              >
                2022 G.C.E. O/L Examination
              </Text>
              <Text
                style={[styles.paperSubtitle, { color: palette.muted }]}
                numberOfLines={1}
              >
                Science • English Medium
              </Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.chip,
                    styles.chipOutline,
                    { borderColor: scienceChip.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: scienceChip.text, fontWeight: "500" },
                    ]}
                  >
                    Science
                  </Text>
                </View>
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: olBadge.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: olBadge.text, fontWeight: "600" },
                    ]}
                  >
                    O/L
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Top Bar with accessible Skip button (>= 44px touch target) */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={handleSkip}
          hitSlop={8}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.skipText, { color: palette.muted }]}>Skip</Text>
        </Pressable>
      </View>

      {/* Horizontal Paged Carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <View style={[styles.slideContainer, { width }]}>
            {/* Slide Graphic */}
            <View style={styles.illustrationWrapper}>
              {renderSlideArt(index)}
            </View>

            {/* Slide Copy */}
            <View style={styles.copyWrapper}>
              <Text
                style={[
                  styles.title,
                  {
                    color: palette.text,
                    fontSize: isSmallScreen ? 24 : 28,
                    lineHeight: isSmallScreen ? 30 : 34,
                  },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: palette.muted,
                    fontSize: isSmallScreen ? 14 : 15,
                    lineHeight: isSmallScreen ? 20 : 22,
                  },
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls: Animated Pagination Dots and 52px Button */}
      <View style={styles.bottomControls}>
        {/* Animated Pagination Dots */}
        <View
          style={styles.dotsContainer}
          accessibilityRole="text"
          accessibilityLabel={`Page ${activeIndex + 1} of ${ONBOARDING_SLIDES.length}`}
        >
          {ONBOARDING_SLIDES.map((_, i) => (
            <PaginationDot
              key={i}
              index={i}
              scrollX={scrollX}
              width={width}
              activeColor={palette.primary}
              inactiveColor={
                colorScheme === "dark" ? palette.border : "#E4E4E7"
              }
            />
          ))}
        </View>

        {/* Full-width 52px Action Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            activeIndex === ONBOARDING_SLIDES.length - 1
              ? "Get started"
              : "Next slide"
          }
          onPress={handleNext}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: palette.primary },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color:
                  colorScheme === "dark"
                    ? palette.background
                    : palette.onForeground,
              },
            ]}
          >
            {activeIndex === ONBOARDING_SLIDES.length - 1
              ? "Get started"
              : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface PaginationDotProps {
  index: number;
  scrollX: { value: number };
  width: number;
  activeColor: string;
  inactiveColor: string;
}

function PaginationDot({
  index,
  scrollX,
  width,
  activeColor,
  inactiveColor,
}: PaginationDotProps) {
  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP,
    );

    return {
      width: dotWidth,
      opacity,
      backgroundColor: activeColor,
    };
  });

  return (
    <View
      style={[
        styles.dotBase,
        { backgroundColor: inactiveColor },
      ]}
    >
      <Animated.View style={[styles.dotPill, animatedDotStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 44,
  },
  skipButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  illustrationWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  backdrop: {
    width: "100%",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    position: "relative",
  },
  skeletonBackCard: {
    width: "82%",
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    opacity: 0.8,
  },
  skeletonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  skeletonBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  floatingCard: {
    width: "92%",
    marginTop: -34,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: "700",
  },
  teacherLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  chipOutline: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  chipText: {
    fontSize: 11,
  },
  floatingBadgesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  pillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chatBubbleStudent: {
    alignSelf: "flex-end",
    maxWidth: "86%",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatTextStudent: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatTimeStudent: {
    fontSize: 10,
    opacity: 0.7,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  chatBubbleTeacher: {
    alignSelf: "flex-start",
    maxWidth: "88%",
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  teacherChatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: "700",
  },
  teacherChatName: {
    fontSize: 12,
    fontWeight: "700",
  },
  teacherTag: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 6,
  },
  chatTextTeacher: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatTimeTeacher: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  paperCard: {
    width: "92%",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  paperRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paperIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  paperIconText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  paperInfo: {
    flex: 1,
  },
  paperTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  paperSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  copyWrapper: {
    paddingHorizontal: 4,
    marginTop: 6,
    marginBottom: 8,
  },
  title: {
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 8,
    letterSpacing: -0.2,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingTop: 4,
    gap: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 20,
  },
  dotBase: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  dotPill: {
    height: 8,
    borderRadius: 4,
  },
  actionButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
