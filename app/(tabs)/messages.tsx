import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

const conversations = [
  {
    name: "Study pod",
    preview: "Your group is ready for the 5 PM review.",
    time: "Now",
  },
  {
    name: "Dr. Cole",
    preview: "Great work on your draft—let’s tighten the conclusion.",
    time: "12m",
  },
  {
    name: "Mentor circle",
    preview: "Three new questions were posted in the community room.",
    time: "1h",
  },
];

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Message</Text>

      {conversations.map((conversation) => (
        <View
          key={conversation.name}
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: palette.muted }]}>
            <Text style={[styles.avatarText, { color: palette.text }]}>
              {conversation.name.slice(0, 1)}
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.name}>{conversation.name}</Text>
              <Text style={[styles.time, { color: palette.mutedText }]}>
                {conversation.time}
              </Text>
            </View>
            <Text style={[styles.preview, { color: palette.mutedText }]}>
              {conversation.preview}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    marginBottom: 18,
  },
  card: {
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
    fontSize: 15,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  name: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    flexShrink: 1,
  },
  time: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
  },
  preview: {
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },
});
