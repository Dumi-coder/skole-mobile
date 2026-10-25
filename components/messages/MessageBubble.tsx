import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { ProfileAvatar } from "./ProfileAvatar";

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

type MessageBubbleProps = {
  message: ChatMessageItem;
  showSenderName?: boolean;
  onReply?: (message: ChatMessageItem) => void;
};

function formatMessageTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function MessageBubble({
  message,
  showSenderName = true,
  onReply,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const isOutgoing = Boolean(message.outgoing || message.sender === "me");
  const displayContent = message.content || message.text || "";
  const timeStr = message.createdAt
    ? formatMessageTime(message.createdAt)
    : message.time || "";

  return (
    <View
      style={[
        styles.rowContainer,
        isOutgoing ? styles.rowOutgoing : styles.rowIncoming,
      ]}
    >
      {!isOutgoing && (
        <View style={styles.avatarGutter}>
          <ProfileAvatar name={message.senderName ?? "User"} size={30} />
        </View>
      )}

      <View style={[styles.bubbleWrapper, isOutgoing && styles.bubbleWrapperOutgoing]}>
        <Pressable
          onLongPress={() => onReply?.(message)}
          style={[
            styles.bubble,
            isOutgoing
              ? [
                  styles.outgoingBubble,
                  {
                    backgroundColor: palette.tint,
                  },
                ]
              : [
                  styles.incomingBubble,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                  },
                ],
          ]}
        >
          {/* Sender Identity for Incoming in Groups */}
          {!isOutgoing && showSenderName && message.senderName ? (
            <Text style={[styles.senderName, { color: palette.mutedText }]}>
              {message.senderName}
            </Text>
          ) : null}

          {/* Quoted Reply context */}
          {message.replyTo ? (
            <View
              style={[
                styles.replyQuote,
                isOutgoing ? styles.replyQuoteOutgoing : styles.replyQuoteIncoming,
                {
                  borderColor: isOutgoing ? "rgba(255,255,255,0.4)" : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.replyAuthor,
                  {
                    color: isOutgoing ? "#ffffff" : palette.text,
                  },
                ]}
                numberOfLines={1}
              >
                {message.replyTo.senderName}
              </Text>
              <Text
                style={[
                  styles.replyBody,
                  {
                    color: isOutgoing ? "rgba(255,255,255,0.85)" : palette.mutedText,
                  },
                ]}
                numberOfLines={1}
              >
                {message.replyTo.body}
              </Text>
            </View>
          ) : null}

          {/* Message Content */}
          <Text
            style={[
              styles.content,
              {
                color: isOutgoing ? "#ffffff" : palette.text,
              },
            ]}
          >
            {displayContent}
          </Text>

          {/* Timestamp Footer */}
          <View style={styles.footerRow}>
            {timeStr ? (
              <Text
                style={[
                  styles.time,
                  {
                    color: isOutgoing ? "rgba(255,255,255,0.7)" : palette.mutedText,
                  },
                ]}
              >
                {timeStr}
              </Text>
            ) : null}
            {isOutgoing && (
              <View style={styles.statusCheck}>
                <SymbolView
                  name={{ ios: "checkmark", android: "check", web: "check" }}
                  tintColor="rgba(255,255,255,0.7)"
                  size={12}
                />
              </View>
            )}
          </View>
        </Pressable>

        {/* Quick Reply Button */}
        {onReply && (
          <Pressable
            hitSlop={8}
            onPress={() => onReply(message)}
            style={[
              styles.quickReplyBtn,
              isOutgoing ? styles.quickReplyBtnOutgoing : styles.quickReplyBtnIncoming,
            ]}
          >
            <SymbolView
              name={{
                ios: "arrowshape.turn.up.left",
                android: "reply",
                web: "reply",
              }}
              tintColor={palette.mutedText}
              size={14}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: "flex-end",
  },
  rowOutgoing: {
    justifyContent: "flex-end",
  },
  rowIncoming: {
    justifyContent: "flex-start",
  },
  avatarGutter: {
    marginRight: 8,
    marginBottom: 4,
  },
  bubbleWrapper: {
    maxWidth: "78%",
    position: "relative",
  },
  bubbleWrapperOutgoing: {
    alignItems: "flex-end",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  incomingBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  outgoingBubble: {
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  replyQuote: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 2,
    marginBottom: 6,
    borderRadius: 4,
  },
  replyQuoteOutgoing: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  replyQuoteIncoming: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  replyAuthor: {
    fontSize: 11,
    fontWeight: "700",
  },
  replyBody: {
    fontSize: 11,
    marginTop: 1,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 10,
    lineHeight: 12,
  },
  statusCheck: {
    marginLeft: 2,
  },
  quickReplyBtn: {
    position: "absolute",
    bottom: 2,
    padding: 6,
    opacity: 0.6,
  },
  quickReplyBtnOutgoing: {
    left: -28,
  },
  quickReplyBtnIncoming: {
    right: -28,
  },
});
