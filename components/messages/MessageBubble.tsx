import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { Message } from "@/types/message";

export type ChatMessageItem = {
  id: string;
  conversationId?: string;
  senderId?: string;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  content?: string;
  text?: string;
  createdAt?: string;
  time?: string;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    senderName: string;
    body: string;
  } | null;
  outgoing?: boolean;
  sender?: "me" | "them";
};

export type MessageBubbleProps = {
  message: Message | ChatMessageItem;
  showSenderName?: boolean;
  onReply?: (message: any) => void;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const isMine =
    ("sender" in message && message.sender === "me") ||
    Boolean("outgoing" in message && message.outgoing);
  const textContent =
    ("text" in message && message.text) ||
    ("content" in message && message.content) ||
    "";
  const timeDisplay =
    ("time" in message && message.time) ||
    ("createdAt" in message && message.createdAt) ||
    "";

  return (
    <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
      <View
        style={[
          styles.bubble,
          isMine
            ? { backgroundColor: palette.foreground }
            : { backgroundColor: palette.subtleBg },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isMine ? palette.onForeground : palette.text,
            },
          ]}
        >
          {textContent}
        </Text>
        {timeDisplay ? (
          <Text
            style={[
              styles.time,
              {
                color: isMine ? palette.onForeground : palette.muted,
                opacity: isMine ? 0.75 : 1,
              },
            ]}
          >
            {timeDisplay}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 12,
  },
  rowLeft: {
    justifyContent: "flex-start",
  },
  rowRight: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  time: {
    marginTop: 6,
    fontSize: 10,
  },
});
