import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type BecomeTeacherModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
};

const SUBJECT_OPTIONS = [
  "Combined Maths",
  "Physics",
  "Chemistry",
  "Biology",
  "ICT",
  "English",
  "Mathematics",
  "Science",
  "Accounting",
  "Business Studies",
  "Economics",
  "History",
];

const GRADE_OPTIONS = ["Grade 6-9", "Grade 10-11 (O/L)", "Grade 12-13 (A/L)"];
const MEDIUM_OPTIONS = ["English", "Sinhala", "Tamil"];
const DELIVERY_MODES = ["Online", "Physical", "Both Online & Physical"];

export function BecomeTeacherModal({
  visible,
  onClose,
  onSubmitSuccess,
}: BecomeTeacherModalProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Combined Maths",
  ]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([
    "Grade 12-13 (A/L)",
  ]);
  const [selectedMediums, setSelectedMediums] = useState<string[]>([
    "English",
    "Sinhala",
  ]);

  const [primaryDistrict, setPrimaryDistrict] = useState("Colombo");
  const [deliveryMode, setDeliveryMode] = useState("Both Online & Physical");

  const [qualification, setQualification] = useState("Bachelor's Degree");
  const [institution, setInstitution] = useState(
    "University of Colombo"
  );
  const [bio, setBio] = useState(
    "Dedicated tutor passionate about simplifying complex concepts for students."
  );

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const toggleMedium = (med: string) => {
    setSelectedMediums((prev) =>
      prev.includes(med) ? prev.filter((m) => m !== med) : [...prev, med]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess();
    }, 1200);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setStep(1);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleResetAndClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleResetAndClose} />
        <SafeAreaView
          edges={["bottom"]}
          style={[
            styles.container,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: palette.border }]}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <SymbolView
                  name={{
                    ios: "graduationcap.fill",
                    android: "school",
                    web: "school",
                  }}
                  tintColor="#ffffff"
                  size={18}
                />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.text }]}>
                  Become a Teacher
                </Text>
                <Text style={[styles.subtitle, { color: palette.mutedText }]}>
                  {submitted
                    ? "Application Received"
                    : `Step ${step} of 4: ${
                        step === 1
                          ? "Contact & Identity"
                          : step === 2
                          ? "Subjects & Medium"
                          : step === 3
                          ? "Locations & Delivery"
                          : "Qualifications & Bio"
                      }`}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleResetAndClose}
              hitSlop={8}
              style={[styles.closeBtn, { backgroundColor: palette.subtleBg }]}
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                tintColor={palette.text}
                size={16}
              />
            </Pressable>
          </View>

          {/* Stepper Progress Bar */}
          {!submitted && (
            <View style={styles.progressBar}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor:
                        i <= step
                          ? "#0a66c2"
                          : colorScheme === "dark"
                          ? "#334155"
                          : "#e2e8f0",
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {submitted ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconWrapper}>
                  <SymbolView
                    name={{
                      ios: "checkmark.circle.fill",
                      android: "check_circle",
                      web: "check_circle",
                    }}
                    tintColor="#10b981"
                    size={64}
                  />
                </View>
                <Text style={[styles.successTitle, { color: palette.text }]}>
                  Application Submitted!
                </Text>
                <Text
                  style={[styles.successDesc, { color: palette.mutedText }]}
                >
                  Thank you for applying to teach on sKole. Our verification
                  team will review your credentials and contact you within 24 to
                  48 hours.
                </Text>

                <View
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.summaryHeader, { color: palette.text }]}
                  >
                    Application Summary
                  </Text>
                  <Text
                    style={[styles.summaryLine, { color: palette.mutedText }]}
                  >
                    • Name: {firstName || "Dumi"} {lastName || "Perera"}
                  </Text>
                  <Text
                    style={[styles.summaryLine, { color: palette.mutedText }]}
                  >
                    • Subjects: {selectedSubjects.join(", ")}
                  </Text>
                  <Text
                    style={[styles.summaryLine, { color: palette.mutedText }]}
                  >
                    • Mode: {deliveryMode} ({primaryDistrict})
                  </Text>
                  <Text
                    style={[styles.summaryLine, { color: palette.mutedText }]}
                  >
                    • Qualification: {qualification}
                  </Text>
                </View>

                <Pressable
                  onPress={handleResetAndClose}
                  style={[styles.doneBtn, { backgroundColor: "#0a66c2" }]}
                >
                  <Text style={styles.doneBtnText}>Back to Profile</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {step === 1 && (
                  <View style={styles.stepContainer}>
                    <Text
                      style={[styles.sectionHeading, { color: palette.text }]}
                    >
                      Personal & Contact Details
                    </Text>
                    <Text
                      style={[
                        styles.sectionSubtext,
                        { color: palette.mutedText },
                      ]}
                    >
                      Please provide your legal name and contact number for
                      verification.
                    </Text>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: palette.text }]}>
                        First Name <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="e.g. Dumi"
                        placeholderTextColor={palette.mutedText}
                        style={[
                          styles.input,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: palette.text }]}>
                        Last Name <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="e.g. Perera"
                        placeholderTextColor={palette.mutedText}
                        style={[
                          styles.input,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: palette.text }]}>
                        Mobile / WhatsApp Number{" "}
                        <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="077 123 4567"
                        placeholderTextColor={palette.mutedText}
                        keyboardType="phone-pad"
                        style={[
                          styles.input,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: palette.text }]}>
                        National Identity Card (NIC){" "}
                        <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        value={nic}
                        onChangeText={setNic}
                        placeholder="e.g. 199512345678 or 951234567V"
                        placeholderTextColor={palette.mutedText}
                        style={[
                          styles.input,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {step === 2 && (
                  <View style={styles.stepContainer}>
                    <Text
                      style={[styles.sectionHeading, { color: palette.text }]}
                    >
                      Subjects & Curriculum
                    </Text>
                    <Text
                      style={[
                        styles.sectionSubtext,
                        { color: palette.mutedText },
                      ]}
                    >
                      Select what you plan to teach on sKole.
                    </Text>

                    <Text style={[styles.label, { color: palette.text }]}>
                      Select Subjects:
                    </Text>
                    <View style={styles.chipGrid}>
                      {SUBJECT_OPTIONS.map((sub) => {
                        const active = selectedSubjects.includes(sub);
                        return (
                          <Pressable
                            key={sub}
                            onPress={() => toggleSubject(sub)}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active
                                  ? "#0a66c2"
                                  : palette.subtleBg,
                                borderColor: active
                                  ? "#0a66c2"
                                  : palette.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                {
                                  color: active ? "#ffffff" : palette.text,
                                  fontWeight: active ? "700" : "500",
                                },
                              ]}
                            >
                              {sub}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Text
                      style={[
                        styles.label,
                        { color: palette.text, marginTop: 16 },
                      ]}
                    >
                      Grades:
                    </Text>
                    <View style={styles.chipGrid}>
                      {GRADE_OPTIONS.map((grd) => {
                        const active = selectedGrades.includes(grd);
                        return (
                          <Pressable
                            key={grd}
                            onPress={() => toggleGrade(grd)}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active
                                  ? "#0a66c2"
                                  : palette.subtleBg,
                                borderColor: active
                                  ? "#0a66c2"
                                  : palette.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                {
                                  color: active ? "#ffffff" : palette.text,
                                  fontWeight: active ? "700" : "500",
                                },
                              ]}
                            >
                              {grd}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Text
                      style={[
                        styles.label,
                        { color: palette.text, marginTop: 16 },
                      ]}
                    >
                      Medium of Instruction:
                    </Text>
                    <View style={styles.chipGrid}>
                      {MEDIUM_OPTIONS.map((med) => {
                        const active = selectedMediums.includes(med);
                        return (
                          <Pressable
                            key={med}
                            onPress={() => toggleMedium(med)}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active
                                  ? "#0a66c2"
                                  : palette.subtleBg,
                                borderColor: active
                                  ? "#0a66c2"
                                  : palette.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                {
                                  color: active ? "#ffffff" : palette.text,
                                  fontWeight: active ? "700" : "500",
                                },
                              ]}
                            >
                              {med}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                {step === 3 && (
                  <View style={styles.stepContainer}>
                    <Text
                      style={[styles.sectionHeading, { color: palette.text }]}
                    >
                      Location & Delivery Mode
                    </Text>
                    <Text
                      style={[
                        styles.sectionSubtext,
                        { color: palette.mutedText },
                      ]}
                    >
                      Where and how do you prefer to conduct lessons?
                    </Text>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: palette.text }]}>
                        Primary District / Base
                      </Text>
                      <TextInput
                        value={primaryDistrict}
                        onChangeText={setPrimaryDistrict}
                        placeholder="e.g. Colombo, Kandy, Galle"
                        placeholderTextColor={palette.mutedText}
                        style={[
                          styles.input,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={[
                        styles.label,
                        { color: palette.text, marginTop: 12 },
                      ]}
                    >
                      Delivery Mode:
                    </Text>
                    <View style={styles.radioList}>
                      {DELIVERY_MODES.map((mode) => {
                        const active = deliveryMode === mode;
                        return (
                          <Pressable
                            key={mode}
                            onPress={() => setDeliveryMode(mode)}
                            style={[
                              styles.radioCard,
                              {
                                backgroundColor: active
                                  ? colorScheme === "dark"
                                    ? "#1e293b"
                                    : "#f0f9ff"
                                  : palette.card,
                                borderColor: active
                                  ? "#0a66c2"
                                  : palette.border,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.radioCircle,
                                {
                                  borderColor: active
                                    ? "#0a66c2"
                                    : palette.mutedText,
                                },
                              ]}
                            >
                              {active && <View style={styles.radioDot} />}
                            </View>
                            <Text
                              style={[
                                styles.radioLabel,
                                {
                                  color: active ? "#0a66c2" : palette.text,
                                  fontWeight: active ? "700" : "500",
                                },
                              ]}
                            >
                              {mode}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                {step === 4 && (
                  <View style={styles.stepContainer}>
                    <Text
                      style={[styles.sectionHeading, { color: palette.text }]}
                    >
                      Qualifications & Bio
                    </Text>
                    <Text
                      style={[
                        styles.sectionSubtext,
                        { color: palette.mutedText },
                      ]}
                    >
                      Highlight your educational background and teaching
                      philosophy.
                    </Text>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: palette.text }]}>
                        Highest Qualification
                      </Text>
                      <TextInput
                        value={qualification}
                        onChangeText={setQualification}
                        placeholder="e.g. B.Sc. in Mathematics, B.Eng"
                        placeholderTextColor={palette.mutedText}
                        style={[
                          styles.input,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: palette.text }]}>
                        University / Institution
                      </Text>
                      <TextInput
                        value={institution}
                        onChangeText={setInstitution}
                        placeholder="e.g. University of Colombo"
                        placeholderTextColor={palette.mutedText}
                        style={[
                          styles.input,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: palette.text }]}>
                        Short Bio / Teaching Statement
                      </Text>
                      <TextInput
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={3}
                        placeholder="Tell students about your experience..."
                        placeholderTextColor={palette.mutedText}
                        style={[
                          styles.textArea,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Action Buttons */}
          {!submitted && (
            <View
              style={[
                styles.footer,
                {
                  borderTopColor: palette.border,
                  backgroundColor: palette.card,
                },
              ]}
            >
              {step > 1 ? (
                <Pressable
                  onPress={handleBack}
                  style={[styles.backBtn, { borderColor: palette.border }]}
                >
                  <Text style={[styles.backBtnText, { color: palette.text }]}>
                    Back
                  </Text>
                </Pressable>
              ) : (
                <View style={{ width: 80 }} />
              )}

              <Pressable
                onPress={handleNext}
                disabled={submitting}
                style={[
                  styles.nextBtn,
                  { backgroundColor: "#0a66c2", opacity: submitting ? 0.7 : 1 },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.nextBtnText}>
                    {step === 4 ? "Submit Application" : "Continue"}
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  container: {
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0a66c2",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  stepContainer: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "700",
  },
  sectionSubtext: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  radioList: {
    gap: 8,
  },
  radioCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0a66c2",
  },
  radioLabel: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  nextBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 130,
  },
  nextBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIconWrapper: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  successDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 12,
  },
  summaryCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
    gap: 6,
  },
  summaryHeader: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryLine: {
    fontSize: 13,
  },
  doneBtn: {
    marginTop: 24,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
