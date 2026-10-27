import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { router, useLocalSearchParams } from "expo-router";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  teachersApi,
  type TeacherClassItem,
  type TeacherProfileData,
} from "@/services/api";
import { Avatar } from "@/components/ui/Avatar";

type ProfileTab = "classes" | "about" | "qualifications" | "materials" | "updates";

export default function TeacherProfileScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("classes");
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [messagingLoading, setMessagingLoading] = useState(false);

  useEffect(() => {
    if (!teacherId) return;

    let isMounted = true;

    teachersApi
      .getTeacherProfile(String(teacherId))
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          const map: Record<string, boolean> = {};
          data.classes.forEach((c) => {
            if (c.isEnrolled) map[c.id] = true;
          });
          setEnrolledMap(map);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoading(false);
          const message =
            err instanceof Error ? err.message : "Could not load teacher profile";
          Alert.alert("Notice", message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [teacherId]);

  const handleToggleEnroll = async (classItem: TeacherClassItem) => {
    const isEnrolled = Boolean(enrolledMap[classItem.id]);
    if (isEnrolled) {
      Alert.alert(
        "Already Enrolled",
        `You are enrolled in ${classItem.name}. You can access class links and materials in your schedule.`,
      );
      return;
    }

    try {
      setEnrollingId(classItem.id);
      await teachersApi.enrollInClass(classItem.id);
      setEnrolledMap((prev) => ({
        ...prev,
        [classItem.id]: true,
      }));
      Alert.alert(
        "Enrolled Successfully!",
        `You have enrolled in ${classItem.name}.`,
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to complete enrollment.";
      Alert.alert("Enrollment", msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const handleOpenMaterial = async (fileUrl?: string | null) => {
    if (!fileUrl) {
      Alert.alert("Resource", "This resource does not have an attached link.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert("Resource", "Cannot open resource link.");
      }
    } catch {
      Alert.alert("Resource", "Failed to open resource link.");
    }
  };

  const handleMessageTeacher = async () => {
    if (!profile) return;
    try {
      setMessagingLoading(true);
      const conv = await teachersApi.getDirectConversation(profile.id);
      if (conv?.id) {
        router.push({
          pathname: "/(tabs)/messages",
          params: {
            conversationId: conv.id,
            peerId: profile.id,
          },
        });
        return;
      }
    } catch {
      // Fallback: navigate with params so messages screen initiates chat
    } finally {
      setMessagingLoading(false);
    }

    router.push({
      pathname: "/(tabs)/messages",
      params: {
        startChatWith: profile.id,
        name: profile.name,
      },
    });
  };

  const initials = profile?.name
    ? profile.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || "")
        .join("")
    : "T";

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "classes", label: `Classes (${profile?.classes.length ?? 0})` },
    { id: "about", label: "About" },
    { id: "qualifications", label: "Credentials" },
    { id: "materials", label: `Materials (${profile?.materials.length ?? 0})` },
  ];

  if (profile?.posts && profile.posts.length > 0) {
    tabs.push({ id: "updates", label: `Updates (${profile.posts.length})` });
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: palette.card,
            borderBottomColor: palette.border,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <SymbolView
            name={{
              ios: "chevron.left",
              android: "arrow_back",
              web: "arrow_back",
            }}
            tintColor={palette.text}
            size={22}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.text }]}>
          Teacher Profile
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.tint} />
          <Text style={[styles.loadingText, { color: palette.mutedText }]}>
            Loading teacher profile...
          </Text>
        </View>
      ) : profile ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cover Banner */}
          <View style={styles.bannerContainer}>
            {profile.bannerUrl ? (
              <Image
                source={{ uri: profile.bannerUrl }}
                style={styles.coverBanner}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.coverBanner,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1e293b" : "#e2e8f0",
                  },
                ]}
              />
            )}
          </View>

          {/* Profile Bar (Avatar + Message Action) */}
          <View style={styles.profileMetaBar}>
            <View
              style={[
                styles.avatarWrapper,
                { borderColor: palette.background },
              ]}
            >
              <Avatar
                label={initials}
                imageUrl={profile.avatarUrl}
                size={76}
                verified={profile.verified}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Message Teacher"
              onPress={handleMessageTeacher}
              disabled={messagingLoading}
              style={[
                styles.messageBtn,
                { backgroundColor: palette.tint, opacity: messagingLoading ? 0.7 : 1 },
              ]}
            >
              {messagingLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <SymbolView
                  name={{
                    ios: "bubble.left.fill",
                    android: "message",
                    web: "message",
                  }}
                  tintColor="#ffffff"
                  size={16}
                />
              )}
              <Text style={styles.messageBtnText}>
                {messagingLoading ? "Opening..." : "Message"}
              </Text>
            </Pressable>
          </View>

          {/* Teacher Details */}
          <View style={styles.detailsContainer}>
            {/* Name & Verified Badge */}
            <View style={styles.nameRow}>
              <Text style={[styles.teacherName, { color: palette.text }]}>
                {profile.name}
              </Text>
              {profile.verified && (
                <View style={styles.verifiedBadge}>
                  <SymbolView
                    name={{
                      ios: "checkmark.seal.fill",
                      android: "verified",
                      web: "check",
                    }}
                    tintColor="#0a66c2"
                    size={20}
                  />
                </View>
              )}
            </View>

            {/* Subject & Grade Chips */}
            <View style={styles.chipsRow}>
              {profile.grades.map((grade) => (
                <View
                  key={grade}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: palette.text }]}>
                    {grade}
                  </Text>
                </View>
              ))}
              {profile.subjects.map((subj) => (
                <View
                  key={subj}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: palette.text }]}>
                    {subj}
                  </Text>
                </View>
              ))}
            </View>

            {/* Locations & Medium */}
            {profile.locations.length > 0 ? (
              <View style={styles.locationRow}>
                <SymbolView
                  name={{
                    ios: "mappin.circle.fill",
                    android: "location_on",
                    web: "location_on",
                  }}
                  tintColor={palette.mutedText}
                  size={16}
                />
                <Text
                  style={[styles.locationText, { color: palette.mutedText }]}
                >
                  {profile.locations.join(" • ")}
                  {profile.mediums.length > 0
                    ? ` • ${profile.mediums.join(", ")} Medium`
                    : ""}
                </Text>
              </View>
            ) : null}

            {/* Key Stats Bar */}
            <View
              style={[
                styles.statsCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: palette.text }]}>
                  {profile.verified ? "Verified" : "Teacher"}
                </Text>
                <Text
                  style={[styles.statLabel, { color: palette.mutedText }]}
                >
                  Status
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: palette.border },
                ]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: palette.text }]}>
                  {profile.classes.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: palette.mutedText }]}
                >
                  Active Classes
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: palette.border },
                ]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: palette.text }]}>
                  {profile.hourlyRate ?? (profile.classes[0]?.fee || "On Request")}
                </Text>
                <Text
                  style={[styles.statLabel, { color: palette.mutedText }]}
                >
                  Fee
                </Text>
              </View>
            </View>

            {/* Segmented Control Tabs */}
            <View
              style={[
                styles.tabRow,
                {
                  backgroundColor: palette.subtleBg,
                  borderColor: palette.border,
                },
              ]}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={[
                      styles.tabButton,
                      isActive && [
                        styles.tabButtonActive,
                        { backgroundColor: palette.card },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color: isActive ? palette.text : palette.mutedText,
                          fontWeight: isActive ? "700" : "500",
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Tab 1: Classes & Schedules */}
            {activeTab === "classes" && (
              <View style={styles.tabContent}>
                {profile.classes.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text
                      style={[
                        styles.emptyCardText,
                        { color: palette.mutedText },
                      ]}
                    >
                      No public classes scheduled currently.
                    </Text>
                  </View>
                ) : (
                  profile.classes.map((c) => {
                    const isEnrolled = Boolean(enrolledMap[c.id]);
                    const isPending = enrollingId === c.id;
                    return (
                      <View
                        key={c.id}
                        style={[
                          styles.classCard,
                          {
                            backgroundColor: palette.card,
                            borderColor: isEnrolled
                              ? palette.tint
                              : palette.border,
                          },
                        ]}
                      >
                        <View style={styles.classHeader}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text
                              style={[
                                styles.className,
                                { color: palette.text },
                              ]}
                            >
                              {c.name}
                            </Text>
                            <Text
                              style={[
                                styles.classMeta,
                                { color: palette.mutedText },
                              ]}
                            >
                              {c.subject} • {c.grade} • {c.medium} Medium
                            </Text>
                          </View>
                          {c.fee ? (
                            <View
                              style={[
                                styles.feeBadge,
                                { backgroundColor: palette.subtleBg },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.feeBadgeText,
                                  { color: palette.tint },
                                ]}
                              >
                                {c.fee}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        {/* Class Timing */}
                        {c.schedule && (
                          <View style={styles.scheduleRow}>
                            <SymbolView
                              name={{
                                ios: "clock.fill",
                                android: "schedule",
                                web: "schedule",
                              }}
                              tintColor={palette.mutedText}
                              size={14}
                            />
                            <Text
                              style={[
                                styles.scheduleText,
                                { color: palette.mutedText },
                              ]}
                            >
                              {c.schedule}
                            </Text>
                          </View>
                        )}

                        {/* Enroll Action */}
                        <View style={styles.classFooter}>
                          <Text
                            style={[
                              styles.capacityText,
                              { color: palette.mutedText },
                            ]}
                          >
                            {c.enrolledCount ?? 0} enrolled
                            {c.maxStudents ? ` / ${c.maxStudents} max` : ""}
                            {" • "}
                            {c.deliveryType === "group"
                              ? "Group Class"
                              : "Individual Mentoring"}
                          </Text>

                          <Pressable
                            onPress={() => handleToggleEnroll(c)}
                            disabled={isPending || isEnrolled}
                            style={[
                              styles.enrollBtn,
                              isEnrolled
                                ? [
                                    styles.enrollBtnActive,
                                    { borderColor: palette.tint },
                                  ]
                                : { backgroundColor: palette.tint },
                            ]}
                          >
                            {isPending ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <Text
                                style={[
                                  styles.enrollBtnText,
                                  {
                                    color: isEnrolled
                                      ? palette.tint
                                      : "#ffffff",
                                  },
                                ]}
                              >
                                {isEnrolled ? "✓ Enrolled" : "Enroll"}
                              </Text>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* Tab 2: About & Bio */}
            {activeTab === "about" && (
              <View style={styles.tabContent}>
                <View
                  style={[
                    styles.cardSection,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    Biography & Teaching Approach
                  </Text>
                  <Text
                    style={[
                      styles.sectionBodyText,
                      { color: palette.mutedText },
                    ]}
                  >
                    {profile.bio ||
                      "Certified and verified educator on the sKole learning platform."}
                  </Text>
                </View>

                {profile.experience ? (
                  <View
                    style={[
                      styles.cardSection,
                      {
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.sectionTitle, { color: palette.text }]}
                    >
                      Teaching Experience & Faculty
                    </Text>
                    <Text
                      style={[
                        styles.sectionBodyText,
                        { color: palette.mutedText },
                      ]}
                    >
                      {profile.experience}
                    </Text>
                  </View>
                ) : null}

                {/* A/L Results if verified on profile */}
                {profile.alResults && profile.alResults.length > 0 ? (
                  <View
                    style={[
                      styles.cardSection,
                      {
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.sectionTitle, { color: palette.text }]}
                    >
                      G.C.E. A/L Examination Results
                    </Text>
                    <View style={styles.alResultsGrid}>
                      {profile.alResults.map((result, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.alResultItem,
                            { backgroundColor: palette.subtleBg, borderColor: palette.border },
                          ]}
                        >
                          <Text style={[styles.alResultSubject, { color: palette.text }]}>
                            {result.subject}
                          </Text>
                          <View style={styles.alGradeBadge}>
                            <Text style={styles.alGradeText}>{result.grade}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            {/* Tab 3: Credentials & Qualifications */}
            {activeTab === "qualifications" && (
              <View style={styles.tabContent}>
                <View
                  style={[
                    styles.cardSection,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    Academic Background & Qualifications
                  </Text>

                  {/* Undergraduate Degree */}
                  {profile.undergradDegreeName ? (
                    <View style={styles.qualRow}>
                      <SymbolView
                        name={{
                          ios: "graduationcap.fill",
                          android: "school",
                          web: "school",
                        }}
                        tintColor={palette.tint}
                        size={20}
                      />
                      <View style={styles.qualInfo}>
                        <Text
                          style={[styles.qualTitle, { color: palette.text }]}
                        >
                          {profile.undergradDegreeName}
                        </Text>
                        <Text
                          style={[
                            styles.qualSub,
                            { color: palette.mutedText },
                          ]}
                        >
                          {profile.universityName || "University"}
                          {profile.facultyName ? ` • Faculty of ${profile.facultyName}` : ""}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Postgraduate / Graduate Degree */}
                  {profile.degreeName ? (
                    <View style={[styles.qualRow, profile.undergradDegreeName ? { marginTop: 14 } : null]}>
                      <SymbolView
                        name={{
                          ios: "graduationcap",
                          android: "school",
                          web: "school",
                        }}
                        tintColor={palette.tint}
                        size={20}
                      />
                      <View style={styles.qualInfo}>
                        <Text
                          style={[styles.qualTitle, { color: palette.text }]}
                        >
                          {profile.degreeName}
                        </Text>
                        <Text
                          style={[
                            styles.qualSub,
                            { color: palette.mutedText },
                          ]}
                        >
                          {profile.universityName || "Accredited University"}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Diploma / Certifications */}
                  {profile.diplomaName ? (
                    <View style={[styles.qualRow, { marginTop: 14 }]}>
                      <SymbolView
                        name={{
                          ios: "rosette",
                          android: "verified",
                          web: "verified",
                        }}
                        tintColor={palette.tint}
                        size={20}
                      />
                      <View style={styles.qualInfo}>
                        <Text
                          style={[styles.qualTitle, { color: palette.text }]}
                        >
                          {profile.diplomaName}
                        </Text>
                        <Text
                          style={[
                            styles.qualSub,
                            { color: palette.mutedText },
                          ]}
                        >
                          Diploma / Professional Qualification
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {!profile.degreeName && !profile.undergradDegreeName && !profile.diplomaName ? (
                    <Text
                      style={[
                        styles.sectionBodyText,
                        { color: palette.mutedText },
                      ]}
                    >
                      Verified teacher credentials on record with sKole.
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            {/* Tab 4: Materials */}
            {activeTab === "materials" && (
              <View style={styles.tabContent}>
                {profile.materials.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text
                      style={[
                        styles.emptyCardText,
                        { color: palette.mutedText },
                      ]}
                    >
                      No study materials uploaded yet.
                    </Text>
                  </View>
                ) : (
                  profile.materials.map((mat) => (
                    <View
                      key={mat.id}
                      style={[
                        styles.materialCard,
                        {
                          backgroundColor: palette.card,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <SymbolView
                        name={{
                          ios: "doc.text.fill",
                          android: "description",
                          web: "description",
                        }}
                        tintColor={palette.tint}
                        size={22}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={[
                            styles.materialTitle,
                            { color: palette.text },
                          ]}
                        >
                          {mat.title}
                        </Text>
                        <Text
                          style={[
                            styles.materialSub,
                            { color: palette.mutedText },
                          ]}
                        >
                          {mat.grade} • {mat.subject}
                          {mat.year ? ` • ${mat.year}` : ""}
                        </Text>
                      </View>

                      {mat.fileUrl ? (
                        <Pressable
                          hitSlop={8}
                          onPress={() => handleOpenMaterial(mat.fileUrl)}
                          style={[
                            styles.downloadBtn,
                            { backgroundColor: palette.subtleBg, borderColor: palette.border },
                          ]}
                        >
                          <SymbolView
                            name={{
                              ios: "arrow.down.circle.fill",
                              android: "download",
                              web: "download",
                            }}
                            tintColor={palette.tint}
                            size={16}
                          />
                          <Text style={[styles.downloadBtnText, { color: palette.text }]}>
                            View
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Tab 5: Updates (Feed Posts) */}
            {activeTab === "updates" && profile.posts && (
              <View style={styles.tabContent}>
                {profile.posts.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text
                      style={[
                        styles.emptyCardText,
                        { color: palette.mutedText },
                      ]}
                    >
                      No updates posted yet.
                    </Text>
                  </View>
                ) : (
                  profile.posts.map((post) => (
                    <View
                      key={post.id}
                      style={[
                        styles.postCard,
                        {
                          backgroundColor: palette.card,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <View style={styles.postHeader}>
                        <Text
                          style={[styles.postTitle, { color: palette.text }]}
                        >
                          {post.title}
                        </Text>
                        <Text
                          style={[
                            styles.postTime,
                            { color: palette.mutedText },
                          ]}
                        >
                          {post.time}
                        </Text>
                      </View>
                      <Text
                        style={[styles.postBody, { color: palette.text }]}
                      >
                        {post.body}
                      </Text>
                      {post.mediaUrl ? (
                        <Image
                          source={{ uri: post.mediaUrl }}
                          style={styles.postImage}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: palette.mutedText }]}>
            Teacher not found.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    height: 110,
    width: "100%",
  },
  coverBanner: {
    height: "100%",
    width: "100%",
  },
  profileMetaBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -38,
    marginBottom: 8,
  },
  avatarWrapper: {
    borderWidth: 4,
    borderRadius: 42,
  },
  messageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 6,
  },
  messageBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  teacherName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  verifiedBadge: {
    paddingTop: 2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  tabRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 11,
  },
  tabButtonActive: {
    ...Platform.select({
      web: { boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 11,
  },
  tabContent: {
    gap: 12,
  },
  classCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  className: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  classMeta: {
    fontSize: 12,
  },
  feeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  feeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  scheduleText: {
    fontSize: 12,
  },
  classFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  capacityText: {
    fontSize: 12,
    flex: 1,
  },
  enrollBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  enrollBtnActive: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  enrollBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardSection: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionBodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  alResultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  alResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  alResultSubject: {
    fontSize: 12,
    fontWeight: "600",
  },
  alGradeBadge: {
    backgroundColor: "#0a66c2",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alGradeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  qualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qualInfo: { flex: 1 },
  qualTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  qualSub: {
    fontSize: 12,
    marginTop: 2,
  },
  materialCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  materialSub: {
    fontSize: 12,
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontSize: 11,
    fontWeight: "600",
  },
  postCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  postTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  postTime: {
    fontSize: 11,
  },
  postBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  postImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
  },
  emptyCardText: {
    fontSize: 13,
  },
});
