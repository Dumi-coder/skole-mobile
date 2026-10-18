import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { Conversation } from "@/types/message";

export function ConversationList({
  conversation,
}: {
  conversation: Conversation;
}) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open conversation with ${conversation.name}`}
      onPress={() =>
        router.push({
          pathname: "/chat/[conversationId]",
          params: { conversationId: conversation.id },
        })
      }
      style={[
        styles.item,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: palette.subtleBg }]}>
        <Text style={[styles.avatarText, { color: palette.text }]}>
          {conversation.avatar ?? conversation.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name}>{conversation.name}</Text>
          <Text style={[styles.time, { color: palette.muted }]}>
            {conversation.time}
          </Text>
        </View>
        <View style={styles.previewRow}>
          <Text
            style={[styles.preview, { color: palette.muted, flex: 1 }]}
            numberOfLines={1}
          >
            {conversation.preview}
          </Text>
          {conversation.unread > 0 ? (
            <View
              style={[
                styles.unread,
                { backgroundColor: palette.foreground },
              ]}
            >
              <Text
                style={[
                  styles.unreadText,
                  { color: palette.onForeground },
                ]}
              >
                {conversation.unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  time: {
    fontSize: 11,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  preview: {
    fontSize: 12,
  },
  unread: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
