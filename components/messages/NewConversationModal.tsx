import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { ProfileAvatar } from "./ProfileAvatar";

type Contact = {
  id: string;
  name: string;
  role: string;
  subject?: string;
};

const SUGGESTED_CONTACTS: Contact[] = [
  { id: "u-t1", name: "Dumi Perera", role: "Teacher", subject: "Maths (AL)" },
  { id: "u-t2", name: "Nimal Fernando", role: "Teacher", subject: "Physics (OL)" },
  { id: "u-t3", name: "Sajini Weerasinghe", role: "Teacher", subject: "Biology (AL)" },
  { id: "u-t4", name: "Kavindu Silva", role: "Teacher", subject: "Chemistry (AL)" },
  { id: "u-s1", name: "Charith Kumara", role: "Student", subject: "Maths Study Group" },
  { id: "u-s2", name: "Rashmi Wickramasinghe", role: "Student", subject: "O/L Study Pod" },
];

type NewConversationModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateDirect: (contact: Contact) => void;
  onCreateGroup: (name: string) => void;
};

export function NewConversationModal({
  visible,
  onClose,
  onCreateDirect,
  onCreateGroup,
}: NewConversationModalProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const [tab, setTab] = useState<"direct" | "group">("direct");
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = SUGGESTED_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateGroup = () => {
    const trimmed = groupName.trim();
    if (!trimmed) return;
    onCreateGroup(trimmed);
    setGroupName("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: palette.background,
              borderColor: palette.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: palette.border }]}>
            <Text style={[styles.title, { color: palette.text }]}>
              New Message
            </Text>
            <Pressable hitSlop={10} onPress={onClose} style={styles.closeBtn}>
              <SymbolView
                name={{ ios: "xmark.circle.fill", android: "close", web: "close" }}
                tintColor={palette.mutedText}
                size={22}
              />
            </Pressable>
          </View>

          {/* Tab selector */}
          <View
            style={[
              styles.tabSelector,
              { backgroundColor: palette.muted, borderColor: palette.border },
            ]}
          >
            <Pressable
              onPress={() => setTab("direct")}
              style={[
                styles.tabBtn,
                tab === "direct" && [
                  styles.tabBtnActive,
                  { backgroundColor: palette.card },
                ],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: tab === "direct" ? palette.text : palette.mutedText,
                    fontWeight: tab === "direct" ? "700" : "500",
                  },
                ]}
              >
                Direct Message
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTab("group")}
              style={[
                styles.tabBtn,
                tab === "group" && [
                  styles.tabBtnActive,
                  { backgroundColor: palette.card },
                ],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: tab === "group" ? palette.text : palette.mutedText,
                    fontWeight: tab === "group" ? "700" : "500",
                  },
                ]}
              >
                Study Group
              </Text>
            </Pressable>
          </View>

          {/* Tab Content */}
          {tab === "direct" ? (
            <View style={styles.tabContent}>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search teachers or students..."
                placeholderTextColor={palette.mutedText}
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: palette.muted,
                    color: palette.text,
                    borderColor: palette.border,
                  },
                ]}
              />

              <ScrollView
                style={styles.contactList}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.sectionHeading, { color: palette.mutedText }]}>
                  Suggested Contacts
                </Text>
                {filteredContacts.map((contact) => (
                  <Pressable
                    key={contact.id}
                    onPress={() => {
                      onCreateDirect(contact);
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.contactRow,
                      {
                        borderBottomColor: palette.border,
                        backgroundColor: pressed ? palette.muted : "transparent",
                      },
                    ]}
                  >
                    <ProfileAvatar name={contact.name} size={40} />
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: palette.text }]}>
                        {contact.name}
                      </Text>
                      <Text
                        style={[styles.contactMeta, { color: palette.mutedText }]}
                      >
                        {contact.subject ? `${contact.role} • ${contact.subject}` : contact.role}
                      </Text>
                    </View>
                    <SymbolView
                      name={{
                        ios: "chevron.right",
                        android: "arrow_forward",
                        web: "arrow_forward",
                      }}
                      tintColor={palette.mutedText}
                      size={14}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.tabContent}>
              <Text style={[styles.label, { color: palette.text }]}>
                Group or Class Name
              </Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g. 2026 A/L Physics Revision Pod"
                placeholderTextColor={palette.mutedText}
                style={[
                  styles.groupInput,
                  {
                    backgroundColor: palette.muted,
                    color: palette.text,
                    borderColor: palette.border,
                  },
                ]}
              />

              <Pressable
                onPress={handleCreateGroup}
                disabled={!groupName.trim()}
                style={[
                  styles.createGroupBtn,
                  {
                    backgroundColor: groupName.trim()
                      ? palette.tint
                      : palette.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.createGroupBtnText,
                    {
                      color: groupName.trim() ? "#ffffff" : palette.mutedText,
                    },
                  ]}
                >
                  Create Group
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: "85%",
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  tabSelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: {
    ...Platform.select({
      web: {
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
      },
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
    fontSize: 13,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchInput: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginVertical: 8,
  },
  contactList: {
    maxHeight: 340,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600",
  },
  contactMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  groupInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 20,
  },
  createGroupBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  createGroupBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
