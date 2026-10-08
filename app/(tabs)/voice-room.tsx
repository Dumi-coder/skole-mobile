import { Pressable, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

const rooms = [
  {
    name: "Peer sprint",
    members: "18 listeners",
    description: "Focus review and accountability check-in.",
  },
  {
    name: "Mentor lounge",
    members: "9 listeners",
    description: "Casual Q&A with guest educators and tutors.",
  },
  {
    name: "Research roundtable",
    members: "12 listeners",
    description: "Discuss sources, methods, and next steps together.",
  },
];

export default function VoiceRoomScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Room</Text>
      <Text style={[styles.subtitle, { color: palette.mutedText }]}>
        Join an active room and keep your study momentum going.
      </Text>

      {rooms.map((room) => (
        <Pressable
          key={room.name}
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: palette.muted }]}>
            <Text style={[styles.badgeText, { color: palette.text }]}>
              Live
            </Text>
          </View>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={[styles.members, { color: palette.mutedText }]}>
            {room.members}
          </Text>
          <Text style={[styles.description, { color: palette.mutedText }]}>
            {room.description}
          </Text>
        </Pressable>
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  roomName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  members: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
