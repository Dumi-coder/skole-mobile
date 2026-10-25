import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SymbolView } from "expo-symbols";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type ReplyTarget = {
  id: string;
  senderName: string;
  body: string;
};

type MessageComposerProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  onSend?: (content?: string, replyToId?: string | null) => void;
  placeholder?: string;
  replyTarget?: ReplyTarget | null;
  onClearReply?: () => void;
  disabled?: boolean;
};

export function MessageComposer({
  value,
  onChangeText,
  onSend,
  placeholder = "Write a message...",
  replyTarget,
  onClearReply,
  disabled = false,
}: MessageComposerProps) {
  const [internalText, setInternalText] = useState("");
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  const isControlled = value !== undefined;
  const currentText = isControlled ? value : internalText;

  const handleTextChange = (text: string) => {
    if (!isControlled) {
      setInternalText(text);
    }
    onChangeText?.(text);
  };

  const handleSend = () => {
    const trimmed = currentText.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed, replyTarget?.id);
    if (!isControlled) {
      setInternalText("");
    }
    onClearReply?.();
  };

  const canSend = Boolean(currentText.trim()) && !disabled;

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: palette.card, borderTopColor: palette.border },
      ]}
    >
      {/* Reply Preview Bar */}
      {replyTarget ? (
        <View
          style={[
            styles.replyBanner,
            {
              backgroundColor: palette.subtleBg,
              borderLeftColor: palette.foreground,
            },
          ]}
        >
          <View style={styles.replyContent}>
            <Text
              style={[styles.replyHeader, { color: palette.foreground }]}
              numberOfLines={1}
            >
              Replying to {replyTarget.senderName}
            </Text>
            <Text
              style={[styles.replySnippet, { color: palette.muted }]}
              numberOfLines={1}
            >
              {replyTarget.body}
            </Text>
          </View>
          {onClearReply && (
            <Pressable
              hitSlop={8}
              onPress={onClearReply}
              style={styles.clearReplyBtn}
            >
              <SymbolView
                name={{ ios: "xmark.circle.fill", android: "close", web: "close" }}
                tintColor={palette.muted}
                size={18}
              />
            </Pressable>
          )}
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          value={currentText}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={palette.muted}
          accessibilityLabel="Message input"
          multiline
          maxLength={1000}
          editable={!disabled}
          style={[
            styles.input,
            {
              backgroundColor: palette.subtleBg,
              color: palette.text,
              borderColor: palette.border,
            },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend ? palette.foreground : palette.subtleBg,
            },
          ]}
        >
          <Text
            style={[
              styles.sendText,
              { color: canSend ? palette.onForeground : palette.muted },
            ]}
          >
            Send
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  replyContent: {
    flex: 1,
    marginRight: 8,
  },
  replyHeader: {
    fontSize: 11,
    fontWeight: "700",
  },
  replySnippet: {
    fontSize: 12,
    marginTop: 1,
  },
  clearReplyBtn: {
    padding: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
