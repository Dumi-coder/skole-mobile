import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  teachersApi,
  type TeacherClassItem,
  type TeacherProfileData,
} from "@/services/api";
import { ProfileAvatar } from "@/components/messages/ProfileAvatar";

type TeacherProfileModalProps = {
  visible: boolean;
  teacherId: string | null;
  onClose: () => void;
  onMessageTeacher?: (teacherId: string, teacherName: string) => void;
};

export function TeacherProfileModal({
  visible,
  teacherId,
  onClose,
  onMessageTeacher,
}: TeacherProfileModalProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [loadingTeacherId, setLoadingTeacherId] = useState<string | null>(null);
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});

  const loading = !profile || loadingTeacherId !== teacherId;

  useEffect(() => {
    if (!teacherId || !visible) return;

    let isMounted = true;

    teachersApi
      .getTeacherProfile(teacherId)
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setLoadingTeacherId(teacherId);
          // initialize enrolled states
          const map: Record<string, boolean> = {};
          data.classes.forEach((c) => {
            if (c.isEnrolled) map[c.id] = true;
          });
          setEnrolledMap(map);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingTeacherId(teacherId);
          Alert.alert("Error", "Could not load teacher profile");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [teacherId, visible]);

  if (!visible) return null;

  const handleToggleEnroll = async (classItem: TeacherClassItem) => {
    const isEnrolled = Boolean(enrolledMap[classItem.id]);
    if (isEnrolled) {
      Alert.alert(
        "Already Enrolled",
        `You are enrolled in ${classItem.name}.`,
      );
      return;
    }

    try {
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
        error instanceof Error ? error.message : "Failed to enroll.";
      Alert.alert("Enrollment", msg);
    }
  };

  const handleDownloadPaper = async (fileUrl?: string | null) => {
    if (!fileUrl) {
      Alert.alert("Resource", "No download link attached to this resource.");
      return;
    }
    try {
      await Linking.openURL(fileUrl);
    } catch {
      Alert.alert("Resource", "Failed to open resource link.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
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
          <Pressable hitSlop={10} onPress={onClose} style={styles.backButton}>
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
          <View style={{ width: 28 }} />
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
              <View
                style={[
                  styles.coverBanner,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1e293b" : "#e2e8f0",
                  },
                ]}
              />
            </View>

            {/* Profile Bar (Avatar + Message Action) */}
            <View style={styles.profileMetaBar}>
              <View style={[styles.avatarWrapper, { borderColor: palette.background }]}>
                <ProfileAvatar name={profile.name} size={76} />
              </View>

              {onMessageTeacher ? (
                <Pressable
                  onPress={() => {
                    onClose();
                    onMessageTeacher(profile.id, profile.name);
                  }}
                  style={[
                    styles.messageBtn,
                    { backgroundColor: palette.tint },
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: "bubble.left.fill",
                      android: "message",
                      web: "message",
                    }}
                    tintColor="#ffffff"
                    size={16}
                  />
                  <Text style={styles.messageBtnText}>Message</Text>
                </Pressable>
              ) : null}
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
                      size={18}
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
                {profile.mediums.map((med) => (
                  <View
                    key={med}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.chipText, { color: palette.mutedText }]}
                    >
                      {med} Medium
                    </Text>
                  </View>
                ))}
              </View>

              {/* Locations */}
              <View style={styles.locationsRow}>
                <SymbolView
                  name={{
                    ios: "mappin.and.ellipse",
                    android: "location_on",
                    web: "location_on",
                  }}
                  tintColor={palette.mutedText}
                  size={14}
                />
                <Text
                  style={[styles.locationText, { color: palette.mutedText }]}
                >
                  {profile.locations.join(" • ")}
                </Text>
              </View>

              {/* Bio */}
              {profile.bio ? (
                <Text
                  style={[styles.bioText, { color: palette.text }]}
                >
                  {profile.bio}
                </Text>
              ) : null}
            </View>

            {/* Qualifications Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text
                  style={[styles.sectionTitle, { color: palette.text }]}
                >
                  Qualifications
                </Text>
                <View
                  style={[
                    styles.sectionDivider,
                    { backgroundColor: palette.border },
                  ]}
                />
              </View>

              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                  },
                ]}
              >
                {profile.undergradDegreeName ? (
                  <View style={styles.qualItem}>
                    <Text style={[styles.qualLabel, { color: palette.mutedText }]}>
                      UNDERGRADUATE DEGREE
                    </Text>
                    <Text style={[styles.qualValue, { color: palette.text }]}>
                      {profile.undergradDegreeName}
                    </Text>
                    {profile.universityName ? (
                      <Text style={[styles.qualSub, { color: palette.mutedText }]}>
                        {profile.universityName}
                        {profile.facultyName ? ` • Faculty of ${profile.facultyName}` : ""}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                {profile.degreeName ? (
                  <View style={styles.qualItem}>
                    <Text style={[styles.qualLabel, { color: palette.mutedText }]}>
                      GRADUATE DEGREE
                    </Text>
                    <Text style={[styles.qualValue, { color: palette.text }]}>
                      {profile.degreeName}
                    </Text>
                    {profile.universityName ? (
                      <Text style={[styles.qualSub, { color: palette.mutedText }]}>
                        {profile.universityName}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                {profile.diplomaName ? (
                  <View
                    style={[
                      styles.qualItem,
                      { borderTopWidth: 1, borderTopColor: palette.border },
                    ]}
                  >
                    <Text style={[styles.qualLabel, { color: palette.mutedText }]}>
                      DIPLOMA & CERTIFICATIONS
                    </Text>
                    <Text style={[styles.qualValue, { color: palette.text }]}>
                      {profile.diplomaName}
                    </Text>
                  </View>
                ) : null}

                {profile.experience ? (
                  <View
                    style={[
                      styles.qualItem,
                      { borderTopWidth: 1, borderTopColor: palette.border },
                    ]}
                  >
                    <Text style={[styles.qualLabel, { color: palette.mutedText }]}>
                      TEACHING EXPERIENCE
                    </Text>
                    <Text style={[styles.qualValue, { color: palette.text }]}>
                      {profile.experience}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Classes Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text
                  style={[styles.sectionTitle, { color: palette.text }]}
                >
                  Classes & Batches
                </Text>
                <View
                  style={[
                    styles.sectionDivider,
                    { backgroundColor: palette.border },
                  ]}
                />
              </View>

              {profile.classes.map((cls) => {
                const isEnrolled = Boolean(enrolledMap[cls.id]);
                return (
                  <View
                    key={cls.id}
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
                          style={[styles.className, { color: palette.text }]}
                        >
                          {cls.name}
                        </Text>
                        <Text
                          style={[
                            styles.classSubject,
                            { color: palette.mutedText },
                          ]}
                        >
                          {cls.grade} • {cls.subject} ({cls.medium})
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.feeBadge,
                          { backgroundColor: palette.subtleBg },
                        ]}
                      >
                        <Text
                          style={[styles.feeBadgeText, { color: palette.text }]}
                        >
                          {cls.fee}
                        </Text>
                      </View>
                    </View>

                    {/* Schedule Row */}
                    <View style={styles.classMetaRow}>
                      <SymbolView
                        name={{
                          ios: "calendar",
                          android: "event",
                          web: "event",
                        }}
                        tintColor={palette.mutedText}
                        size={14}
                      />
                      <Text
                        style={[
                          styles.classMetaText,
                          { color: palette.mutedText },
                        ]}
                      >
                        {cls.schedule}
                      </Text>
                    </View>

                    {/* Enrolled Students & Delivery Type */}
                    <View style={styles.classMetaRow}>
                      <SymbolView
                        name={{
                          ios: "person.2.fill",
                          android: "group",
                          web: "group",
                        }}
                        tintColor={palette.mutedText}
                        size={14}
                      />
                      <Text
                        style={[
                          styles.classMetaText,
                          { color: palette.mutedText },
                        ]}
                      >
                        {cls.enrolledCount} enrolled • {cls.deliveryType === "group" ? "Group Class" : "Individual Mentoring"}
                      </Text>
                    </View>

                    {/* Enroll Button */}
                    <Pressable
                      onPress={() => handleToggleEnroll(cls)}
                      style={[
                        styles.enrollButton,
                        {
                          backgroundColor: isEnrolled
                            ? palette.muted
                            : palette.tint,
                          borderColor: isEnrolled
                            ? palette.border
                            : "transparent",
                          borderWidth: isEnrolled ? 1 : 0,
                        },
                      ]}
                    >
                      {isEnrolled ? (
                        <View style={styles.enrolledRow}>
                          <SymbolView
                            name={{
                              ios: "checkmark",
                              android: "check",
                              web: "check",
                            }}
                            tintColor={palette.text}
                            size={16}
                          />
                          <Text
                            style={[
                              styles.enrollButtonText,
                              { color: palette.text },
                            ]}
                          >
                            Enrolled
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.enrollButtonText,
                            { color: "#ffffff" },
                          ]}
                        >
                          {cls.deliveryType === "group" ? "Join Group" : "Enroll Now"}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {/* Papers & Resources Section */}
            {profile.materials.length > 0 ? (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text
                    style={[styles.sectionTitle, { color: palette.text }]}
                  >
                    Papers & Resources
                  </Text>
                  <View
                    style={[
                      styles.sectionDivider,
                      { backgroundColor: palette.border },
                    ]}
                  />
                </View>

                {profile.materials.map((mat) => (
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
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text
                        style={[styles.materialTitle, { color: palette.text }]}
                        numberOfLines={2}
                      >
                        {mat.title}
                      </Text>
                      <Text
                        style={[
                          styles.materialMeta,
                          { color: palette.mutedText },
                        ]}
                      >
                        {mat.grade} • {mat.subject}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleDownloadPaper(mat.fileUrl)}
                      style={[
                        styles.downloadBtn,
                        {
                          backgroundColor: palette.card,
                          borderColor: palette.border,
                        },
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
                      <Text
                        style={[
                          styles.downloadBtnText,
                          { color: palette.text },
                        ]}
                      >
                        Download
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Teacher Posts */}
            {profile.posts && profile.posts.length > 0 ? (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text
                    style={[styles.sectionTitle, { color: palette.text }]}
                  >
                    Teacher Updates
                  </Text>
                  <View
                    style={[
                      styles.sectionDivider,
                      { backgroundColor: palette.border },
                    ]}
                  />
                </View>

                {profile.posts.map((post) => (
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
                      style={[styles.postBody, { color: palette.mutedText }]}
                    >
                      {post.body}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    width: "100%",
  },
  coverBanner: {
    height: 120,
    width: "100%",
  },
  profileMetaBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -38,
    marginBottom: 12,
  },
  avatarWrapper: {
    borderWidth: 4,
    borderRadius: 44,
  },
  messageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  messageBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  detailsContainer: {
    paddingHorizontal: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
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
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  locationsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionDivider: {
    flex: 1,
    height: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  qualItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  qualLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  qualValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  qualSub: {
    fontSize: 12,
    marginTop: 2,
  },
  classCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  className: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  classSubject: {
    fontSize: 12,
    marginTop: 2,
  },
  feeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  feeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  classMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  classMetaText: {
    fontSize: 12,
  },
  enrollButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  enrolledRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  enrollButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  materialCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  materialTitle: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  materialMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  downloadBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  postCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  postTime: {
    fontSize: 11,
  },
  postBody: {
    fontSize: 12,
    lineHeight: 18,
  },
});
