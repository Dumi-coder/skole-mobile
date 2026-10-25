import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { ProfileAvatar } from "@/components/messages/ProfileAvatar";
import { BecomeTeacherModal } from "@/components/profile/BecomeTeacherModal";
import { DistrictPickerModal } from "@/components/profile/DistrictPickerModal";
import { apiClient, getCurrentSession } from "@/services/api";

type ProfileTabRole = "student" | "teacher";

const SRI_LANKAN_DISTRICTS = [
  { id: "colombo", name: "Colombo" },
  { id: "gampaha", name: "Gampaha" },
  { id: "kalutara", name: "Kalutara" },
  { id: "kandy", name: "Kandy" },
  { id: "matale", name: "Matale" },
  { id: "nuwara-eliya", name: "Nuwara Eliya" },
  { id: "galle", name: "Galle" },
  { id: "matara", name: "Matara" },
  { id: "hambantota", name: "Hambantota" },
  { id: "jaffna", name: "Jaffna" },
  { id: "kilinochchi", name: "Kilinochchi" },
  { id: "mannar", name: "Mannar" },
  { id: "vavuniya", name: "Vavuniya" },
  { id: "mullaitivu", name: "Mullaitivu" },
  { id: "batticaloa", name: "Batticaloa" },
  { id: "ampara", name: "Ampara" },
  { id: "trincomalee", name: "Trincomalee" },
  { id: "kurunegala", name: "Kurunegala" },
  { id: "puttalam", name: "Puttalam" },
  { id: "anuradhapura", name: "Anuradhapura" },
  { id: "polonnaruwa", name: "Polonnaruwa" },
  { id: "badulla", name: "Badulla" },
  { id: "monaragala", name: "Monaragala" },
  { id: "ratnapura", name: "Ratnapura" },
  { id: "kegalle", name: "Kegalle" },
];

const SRI_LANKAN_GRADES = [
  { id: "g6", name: "Grade 6" },
  { id: "g7", name: "Grade 7" },
  { id: "g8", name: "Grade 8" },
  { id: "g9", name: "Grade 9" },
  { id: "g10", name: "Grade 10" },
  { id: "g11", name: "Grade 11 (O/L)" },
  { id: "g12", name: "Grade 12 (A/L)" },
  { id: "g13", name: "Grade 13 (A/L)" },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  // Active persona toggle: "student" or "teacher"
  const [activeTabRole, setActiveTabRole] = useState<ProfileTabRole>("student");

  // Loading & refreshing
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Student Profile state (matching skole.lk)
  const [firstName, setFirstName] = useState("Dumi");
  const [lastName, setLastName] = useState("Perera");
  const [email, setEmail] = useState("dumi.perera@skole.lk");
  const [mobile, setMobile] = useState("077 123 4567");
  const [districtId, setDistrictId] = useState("colombo");
  const [districtName, setDistrictName] = useState("Colombo");
  const [gradeId, setGradeId] = useState("g12");
  const [gradeName, setGradeName] = useState("Grade 12 (A/L)");
  // Activity stats
  const memberSince = "Aug 2024";
  const enrolledClassesCount = 3;
  const sessionsAttendedCount = 14;
  const attendanceRate = "93%";

  // Teacher Privacy Preferences (matching skole.lk PRIVACY_SETTINGS)
  const [teacherPreferences, setTeacherPreferences] = useState({
    showAlResults: true,
    showDegree: true,
    showUniversityInfo: true,
    showDiplomaInfo: false,
  });

  // Account Preferences (matching AccountPreferencesPanel)
  const [darkModeActive, setDarkModeActive] = useState(colorScheme === "dark");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  // Modals
  const [becomeTeacherModalOpen, setBecomeTeacherModalOpen] = useState(false);
  const [districtPickerOpen, setDistrictPickerOpen] = useState(false);
  const [gradePickerOpen, setGradePickerOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfileData = async () => {
      try {
        const session = await getCurrentSession();

        if (session) {
          if (session.role === "teacher") {
            setActiveTabRole("teacher");
          }
          if (session.userId) {
            setEmail(session.userId.includes("@") ? session.userId : "student@skole.lk");
          }
        }

        const data = await apiClient.getProfile("cookie-session");
        if (!active) return;

        if (data.firstName) setFirstName(data.firstName);
        if (data.lastName) setLastName(data.lastName);
        if (data.email) setEmail(data.email);
        if (data.name && !data.firstName) {
          const parts = data.name.split(" ");
          setFirstName(parts[0] || "User");
          setLastName(parts.slice(1).join(" ") || "");
        }
      } catch {
        // Fallback to initial defaults if offline / mock mode
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProfileData();
    return () => {
      active = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await apiClient.getProfile("cookie-session");
      if (data.firstName) setFirstName(data.firstName);
      if (data.lastName) setLastName(data.lastName);
      if (data.email) setEmail(data.email);
    } catch {
      // offline fallback
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveChanges = () => {
    setSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const toggleTeacherPreference = (key: keyof typeof teacherPreferences) => {
    setTeacherPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fullName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || "Student Profile";

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      {/* Top Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: palette.card,
            borderBottomColor: palette.border,
          },
        ]}
      >
        <View style={styles.brandTitleRow}>
          <Text style={[styles.brandText, { color: palette.text }]}>sKole</Text>
          <View style={styles.brandDivider} />
          <Text style={[styles.pageTitle, { color: palette.mutedText }]}>
            My Profile
          </Text>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={palette.tint}
              style={{ marginLeft: 8 }}
            />
          ) : null}
        </View>

        {/* Role Segmented Selector: Student vs Teacher */}
        <View
          style={[
            styles.roleSelector,
            {
              backgroundColor: palette.muted,
              borderColor: palette.border,
            },
          ]}
        >
          <Pressable
            onPress={() => setActiveTabRole("student")}
            style={[
              styles.roleSegment,
              activeTabRole === "student" && {
                backgroundColor: palette.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.12,
                shadowRadius: 2,
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.roleSegmentText,
                {
                  color:
                    activeTabRole === "student"
                      ? palette.text
                      : palette.mutedText,
                  fontWeight: activeTabRole === "student" ? "700" : "500",
                },
              ]}
            >
              Student
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTabRole("teacher")}
            style={[
              styles.roleSegment,
              activeTabRole === "teacher" && {
                backgroundColor: palette.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.12,
                shadowRadius: 2,
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.roleSegmentText,
                {
                  color:
                    activeTabRole === "teacher"
                      ? palette.text
                      : palette.mutedText,
                  fontWeight: activeTabRole === "teacher" ? "700" : "500",
                },
              ]}
            >
              Teacher
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.tint}
          />
        }
      >
        {/* ============================================================== */}
        {/* CARD 1: IDENTITY & AVATAR CARD                                 */}
        {/* ============================================================== */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <ProfileAvatar name={fullName} size={88} />
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Change Photo",
                    "Choose an image from your photo library or take a photo."
                  )
                }
                style={[
                  styles.cameraBadge,
                  {
                    backgroundColor: palette.tint,
                    borderColor: palette.card,
                  },
                ]}
              >
                <SymbolView
                  name={{
                    ios: "camera.fill",
                    android: "photo_camera",
                    web: "photo_camera",
                  }}
                  tintColor="#ffffff"
                  size={14}
                />
              </Pressable>
            </View>

            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, { color: palette.text }]}>
                  {fullName}
                </Text>
                {activeTabRole === "teacher" && (
                  <SymbolView
                    name={{
                      ios: "checkmark.seal.fill",
                      android: "verified",
                      web: "check",
                    }}
                    tintColor="#0a66c2"
                    size={20}
                  />
                )}
              </View>

              <View style={styles.roleBadgeRow}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        activeTabRole === "teacher"
                          ? colorScheme === "dark"
                            ? "#1e293b"
                            : "#eff6ff"
                          : palette.muted,
                      borderColor:
                        activeTabRole === "teacher" ? "#bfdbfe" : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      {
                        color:
                          activeTabRole === "teacher"
                            ? "#0a66c2"
                            : palette.mutedText,
                      },
                    ]}
                  >
                    {activeTabRole === "teacher"
                      ? "Verified Teacher"
                      : "Student Account"}
                  </Text>
                </View>

                {districtName && (
                  <View style={styles.locationTag}>
                    <SymbolView
                      name={{
                        ios: "mappin.and.ellipse",
                        android: "location_on",
                        web: "place",
                      }}
                      tintColor={palette.mutedText}
                      size={13}
                    />
                    <Text
                      style={[
                        styles.locationText,
                        { color: palette.mutedText },
                      ]}
                    >
                      {districtName}, Sri Lanka
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.emailText, { color: palette.mutedText }]}>
                {email}
              </Text>
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* CARD 2: ACTIVITY STATS (Exact skole.lk Activity Card)           */}
        {/* ============================================================== */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <SymbolView
              name={{
                ios: "chart.bar.fill",
                android: "bar_chart",
                web: "bar_chart",
              }}
              tintColor={palette.mutedText}
              size={18}
            />
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              Activity
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: palette.muted,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: palette.text }]}>
                {activeTabRole === "teacher" ? "4" : enrolledClassesCount}
              </Text>
              <Text style={[styles.statLabel, { color: palette.mutedText }]}>
                {activeTabRole === "teacher"
                  ? "Active Classes"
                  : "Enrolled Classes"}
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: palette.muted,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: palette.text }]}>
                {activeTabRole === "teacher" ? "186" : sessionsAttendedCount}
              </Text>
              <Text style={[styles.statLabel, { color: palette.mutedText }]}>
                {activeTabRole === "teacher"
                  ? "Total Students"
                  : "Sessions Attended"}
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: palette.muted,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: "#10b981" }]}>
                {activeTabRole === "teacher" ? "4.9 ★" : attendanceRate}
              </Text>
              <Text style={[styles.statLabel, { color: palette.mutedText }]}>
                {activeTabRole === "teacher" ? "Teacher Rating" : "Attendance"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.memberSinceRow,
              { borderTopColor: palette.border },
            ]}
          >
            <Text style={[styles.memberSinceLabel, { color: palette.mutedText }]}>
              Member Since
            </Text>
            <Text style={[styles.memberSinceValue, { color: palette.text }]}>
              {memberSince}
            </Text>
          </View>
        </View>

        {/* ============================================================== */}
        {/* STUDENT VIEW SPECIFICS: Personal Info + Want to Teach Banner    */}
        {/* ============================================================== */}
        {activeTabRole === "student" && (
          <>
            {/* PERSONAL INFORMATION FORM (matching skole.lk PersonalInfoForm) */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <SymbolView
                  name={{
                    ios: "graduationcap.fill",
                    android: "school",
                    web: "school",
                  }}
                  tintColor="#0a66c2"
                  size={19}
                />
                <Text style={[styles.cardTitle, { color: palette.text }]}>
                  Personal Information
                </Text>
              </View>

              <View style={styles.formContent}>
                {/* First Name & Last Name */}
                <View style={styles.formRowTwoCol}>
                  <View style={styles.formCol}>
                    <Text style={[styles.formLabel, { color: palette.text }]}>
                      First Name
                    </Text>
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="First name"
                      placeholderTextColor={palette.mutedText}
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: palette.muted,
                          borderColor: palette.border,
                          color: palette.text,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.formCol}>
                    <Text style={[styles.formLabel, { color: palette.text }]}>
                      Last Name
                    </Text>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Last name"
                      placeholderTextColor={palette.mutedText}
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: palette.muted,
                          borderColor: palette.border,
                          color: palette.text,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* District Selector */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: palette.text }]}>
                    District
                  </Text>
                  <Pressable
                    onPress={() => setDistrictPickerOpen(true)}
                    style={[
                      styles.selectTrigger,
                      {
                        backgroundColor: palette.muted,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectTriggerText,
                        { color: palette.text },
                      ]}
                    >
                      {districtName || "Select district"}
                    </Text>
                    <SymbolView
                      name={{
                        ios: "chevron.down",
                        android: "keyboard_arrow_down",
                        web: "keyboard_arrow_down",
                      }}
                      tintColor={palette.mutedText}
                      size={16}
                    />
                  </Pressable>
                </View>

                {/* Grade / Level Selector */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: palette.text }]}>
                    Grade / Level
                  </Text>
                  <Pressable
                    onPress={() => setGradePickerOpen(true)}
                    style={[
                      styles.selectTrigger,
                      {
                        backgroundColor: palette.muted,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectTriggerText,
                        { color: palette.text },
                      ]}
                    >
                      {gradeName || "Select grade"}
                    </Text>
                    <SymbolView
                      name={{
                        ios: "chevron.down",
                        android: "keyboard_arrow_down",
                        web: "keyboard_arrow_down",
                      }}
                      tintColor={palette.mutedText}
                      size={16}
                    />
                  </Pressable>
                </View>

                {/* Phone Number */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: palette.text }]}>
                    Phone Number
                  </Text>
                  <TextInput
                    value={mobile}
                    onChangeText={setMobile}
                    placeholder="07X XXX XXXX"
                    placeholderTextColor={palette.mutedText}
                    keyboardType="phone-pad"
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: palette.muted,
                        borderColor: palette.border,
                        color: palette.text,
                      },
                    ]}
                  />
                </View>

                {/* Save Changes Button */}
                <View style={styles.saveActionRow}>
                  {saveSuccess && (
                    <View style={styles.savedBadge}>
                      <SymbolView
                        name={{
                          ios: "checkmark.circle.fill",
                          android: "check_circle",
                          web: "check_circle",
                        }}
                        tintColor="#10b981"
                        size={16}
                      />
                      <Text style={styles.savedBadgeText}>Saved</Text>
                    </View>
                  )}

                  <Pressable
                    onPress={handleSaveChanges}
                    disabled={saving}
                    style={[
                      styles.saveButton,
                      { backgroundColor: palette.tint },
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={palette.card} />
                    ) : (
                      <Text
                        style={[
                          styles.saveButtonText,
                          { color: palette.card },
                        ]}
                      >
                        Save Changes
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            {/* "WANT TO TEACH ON SKOLE?" BANNER (Signature skole.lk feature) */}
            <View style={styles.teachCard}>
              <View style={styles.teachCardHeader}>
                <View style={styles.teachIconCircle}>
                  <SymbolView
                    name={{
                      ios: "graduationcap.fill",
                      android: "school",
                      web: "school",
                    }}
                    tintColor="#ffffff"
                    size={22}
                  />
                </View>
                <View style={styles.teachCardText}>
                  <Text style={styles.teachCardTitle}>
                    Want to Teach on sKole?
                  </Text>
                  <Text style={styles.teachCardBody}>
                    Submit your grades, subjects, location, and certificates to
                    create a verified teacher profile.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setBecomeTeacherModalOpen(true)}
                style={styles.becomeTeacherBtn}
              >
                <Text style={styles.becomeTeacherBtnText}>
                  Become a Teacher
                </Text>
                <SymbolView
                  name={{
                    ios: "arrow.right",
                    android: "arrow_forward",
                    web: "arrow_forward",
                  }}
                  tintColor="#0a66c2"
                  size={15}
                />
              </Pressable>
            </View>
          </>
        )}

        {/* ============================================================== */}
        {/* TEACHER VIEW SPECIFICS: Teacher Settings, Privacy & Classes    */}
        {/* ============================================================== */}
        {activeTabRole === "teacher" && (
          <>
            {/* TEACHER PRIVACY & SECURITY (Exact skole.lk PRIVACY_SETTINGS) */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <SymbolView
                  name={{
                    ios: "eye.fill",
                    android: "visibility",
                    web: "visibility",
                  }}
                  tintColor="#0a66c2"
                  size={18}
                />
                <Text style={[styles.cardTitle, { color: palette.text }]}>
                  Privacy & Security
                </Text>
              </View>

              <View style={styles.preferencesList}>
                <View
                  style={[
                    styles.preferenceRow,
                    {
                      borderBottomColor: palette.border,
                      backgroundColor: palette.muted,
                    },
                  ]}
                >
                  <View style={styles.preferenceInfo}>
                    <Text
                      style={[styles.preferenceLabel, { color: palette.text }]}
                    >
                      A/L Results
                    </Text>
                    <Text
                      style={[
                        styles.preferenceDesc,
                        { color: palette.mutedText },
                      ]}
                    >
                      Show your A/L grades on your public teacher card
                    </Text>
                  </View>
                  <Switch
                    value={teacherPreferences.showAlResults}
                    onValueChange={() =>
                      toggleTeacherPreference("showAlResults")
                    }
                    trackColor={{ false: palette.border, true: "#0a66c2" }}
                  />
                </View>

                <View
                  style={[
                    styles.preferenceRow,
                    {
                      borderBottomColor: palette.border,
                      backgroundColor: palette.muted,
                    },
                  ]}
                >
                  <View style={styles.preferenceInfo}>
                    <Text
                      style={[styles.preferenceLabel, { color: palette.text }]}
                    >
                      Degree Info
                    </Text>
                    <Text
                      style={[
                        styles.preferenceDesc,
                        { color: palette.mutedText },
                      ]}
                    >
                      Show degree name (certificates remain confidential)
                    </Text>
                  </View>
                  <Switch
                    value={teacherPreferences.showDegree}
                    onValueChange={() => toggleTeacherPreference("showDegree")}
                    trackColor={{ false: palette.border, true: "#0a66c2" }}
                  />
                </View>

                <View
                  style={[
                    styles.preferenceRow,
                    {
                      borderBottomColor: palette.border,
                      backgroundColor: palette.muted,
                    },
                  ]}
                >
                  <View style={styles.preferenceInfo}>
                    <Text
                      style={[styles.preferenceLabel, { color: palette.text }]}
                    >
                      University Info
                    </Text>
                    <Text
                      style={[
                        styles.preferenceDesc,
                        { color: palette.mutedText },
                      ]}
                    >
                      Display your university & faculty credentials
                    </Text>
                  </View>
                  <Switch
                    value={teacherPreferences.showUniversityInfo}
                    onValueChange={() =>
                      toggleTeacherPreference("showUniversityInfo")
                    }
                    trackColor={{ false: palette.border, true: "#0a66c2" }}
                  />
                </View>

                <View
                  style={[
                    styles.preferenceRow,
                    {
                      backgroundColor: palette.muted,
                    },
                  ]}
                >
                  <View style={styles.preferenceInfo}>
                    <Text
                      style={[styles.preferenceLabel, { color: palette.text }]}
                    >
                      Diploma Info
                    </Text>
                    <Text
                      style={[
                        styles.preferenceDesc,
                        { color: palette.mutedText },
                      ]}
                    >
                      Show diploma and technical qualifications
                    </Text>
                  </View>
                  <Switch
                    value={teacherPreferences.showDiplomaInfo}
                    onValueChange={() =>
                      toggleTeacherPreference("showDiplomaInfo")
                    }
                    trackColor={{ false: palette.border, true: "#0a66c2" }}
                  />
                </View>
              </View>
            </View>

            {/* TEACHER CLASSES OVERVIEW */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <SymbolView
                  name={{
                    ios: "person.3.fill",
                    android: "groups",
                    web: "groups",
                  }}
                  tintColor="#0a66c2"
                  size={19}
                />
                <Text style={[styles.cardTitle, { color: palette.text }]}>
                  My Teaching Classes
                </Text>
              </View>

              <View style={styles.classList}>
                <View
                  style={[
                    styles.classItem,
                    {
                      backgroundColor: palette.muted,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.classItemLeft}>
                    <Text
                      style={[styles.classItemTitle, { color: palette.text }]}
                    >
                      2026 Combined Maths Revision (A/L)
                    </Text>
                    <Text
                      style={[
                        styles.classItemSchedule,
                        { color: palette.mutedText },
                      ]}
                    >
                      Saturdays • 9:00 AM - 12:00 PM • English Medium
                    </Text>
                  </View>
                  <View style={styles.studentBadge}>
                    <Text style={styles.studentBadgeText}>84 Students</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.classItem,
                    {
                      backgroundColor: palette.muted,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.classItemLeft}>
                    <Text
                      style={[styles.classItemTitle, { color: palette.text }]}
                    >
                      2025 Physics Theory Masterclass (A/L)
                    </Text>
                    <Text
                      style={[
                        styles.classItemSchedule,
                        { color: palette.mutedText },
                      ]}
                    >
                      Sundays • 2:00 PM - 5:00 PM • Sinhala Medium
                    </Text>
                  </View>
                  <View style={styles.studentBadge}>
                    <Text style={styles.studentBadgeText}>62 Students</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ============================================================== */}
        {/* CARD: ACCOUNT PREFERENCES (Exact skole.lk Preferences Panel)    */}
        {/* ============================================================== */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <SymbolView
              name={{
                ios: "gearshape.fill",
                android: "settings",
                web: "settings",
              }}
              tintColor={palette.mutedText}
              size={18}
            />
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              Account Preferences
            </Text>
          </View>

          <View style={styles.preferencesList}>
            <View
              style={[
                styles.preferenceRow,
                {
                  borderBottomColor: palette.border,
                  backgroundColor: palette.muted,
                },
              ]}
            >
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceLabel, { color: palette.text }]}>
                  Dark Mode
                </Text>
                <Text
                  style={[styles.preferenceDesc, { color: palette.mutedText }]}
                >
                  Adjust interface theme for comfortable viewing
                </Text>
              </View>
              <Switch
                value={darkModeActive}
                onValueChange={setDarkModeActive}
                trackColor={{ false: palette.border, true: "#0a66c2" }}
              />
            </View>

            <View
              style={[
                styles.preferenceRow,
                {
                  borderBottomColor: palette.border,
                  backgroundColor: palette.muted,
                },
              ]}
            >
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceLabel, { color: palette.text }]}>
                  Push Notifications
                </Text>
                <Text
                  style={[styles.preferenceDesc, { color: palette.mutedText }]}
                >
                  Receive class announcements and message alerts
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: palette.border, true: "#0a66c2" }}
              />
            </View>

            <View
              style={[
                styles.preferenceRow,
                {
                  backgroundColor: palette.muted,
                },
              ]}
            >
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceLabel, { color: palette.text }]}>
                  Email Updates
                </Text>
                <Text
                  style={[styles.preferenceDesc, { color: palette.mutedText }]}
                >
                  Get weekly summary digests and study material notifications
                </Text>
              </View>
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: palette.border, true: "#0a66c2" }}
              />
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* LOGOUT / SWITCH ACCOUNT BUTTON                                 */}
        {/* ============================================================== */}
        <Pressable
          onPress={() =>
            Alert.alert("Log Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: () => Alert.alert("Signed out successfully"),
              },
            ])
          }
          style={[
            styles.logoutBtn,
            {
              backgroundColor: palette.muted,
              borderColor: palette.border,
            },
          ]}
        >
          <SymbolView
            name={{
              ios: "rectangle.portrait.and.arrow.right",
              android: "logout",
              web: "logout",
            }}
            tintColor="#ef4444"
            size={18}
          />
          <Text style={styles.logoutBtnText}>Log Out of sKole</Text>
        </Pressable>
      </ScrollView>

      {/* District Picker Modal */}
      <DistrictPickerModal
        visible={districtPickerOpen}
        title="Select District"
        items={SRI_LANKAN_DISTRICTS}
        selectedId={districtId}
        onSelect={(id, name) => {
          setDistrictId(id);
          setDistrictName(name);
        }}
        onClose={() => setDistrictPickerOpen(false)}
      />

      {/* Grade Picker Modal */}
      <DistrictPickerModal
        visible={gradePickerOpen}
        title="Select Grade / Level"
        items={SRI_LANKAN_GRADES}
        selectedId={gradeId}
        onSelect={(id, name) => {
          setGradeId(id);
          setGradeName(name);
        }}
        onClose={() => setGradePickerOpen(false)}
      />

      {/* Become Teacher Application Modal */}
      <BecomeTeacherModal
        visible={becomeTeacherModalOpen}
        onClose={() => setBecomeTeacherModalOpen(false)}
        onSubmitSuccess={() => {
          // Switch to teacher view as confirmation
          setTimeout(() => setActiveTabRole("teacher"), 1500);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  brandDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#94a3b8",
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  roleSelector: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    padding: 3,
  },
  roleSegment: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleSegmentText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarSection: {
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  identityDetails: {
    alignItems: "center",
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  roleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationText: {
    fontSize: 12,
  },
  emailText: {
    fontSize: 13,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
    textAlign: "center",
  },
  memberSinceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 14,
  },
  memberSinceLabel: {
    fontSize: 13,
  },
  memberSinceValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  formContent: {
    gap: 14,
  },
  formRowTwoCol: {
    flexDirection: "row",
    gap: 12,
  },
  formCol: {
    flex: 1,
    gap: 6,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  formInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  selectTrigger: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectTriggerText: {
    fontSize: 14,
  },
  saveActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  savedBadgeText: {
    color: "#065f46",
    fontSize: 12,
    fontWeight: "700",
  },
  saveButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  teachCard: {
    borderRadius: 20,
    backgroundColor: "#0a66c2",
    padding: 20,
    gap: 16,
    shadowColor: "#0a66c2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  teachCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  teachIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  teachCardText: {
    flex: 1,
  },
  teachCardTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  teachCardBody: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  becomeTeacherBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  becomeTeacherBtnText: {
    color: "#0a66c2",
    fontSize: 14,
    fontWeight: "700",
  },
  preferencesList: {
    borderRadius: 14,
    overflow: "hidden",
    gap: 1,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  preferenceInfo: {
    flex: 1,
    paddingRight: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  preferenceDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  classList: {
    gap: 10,
  },
  classItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  classItemLeft: {
    flex: 1,
    paddingRight: 10,
  },
  classItemTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  classItemSchedule: {
    fontSize: 12,
    marginTop: 4,
  },
  studentBadge: {
    backgroundColor: "#0a66c2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  studentBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutBtnText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
  },
});
