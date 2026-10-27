import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SymbolView } from "expo-symbols";
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
  replyTarget?: ReplyTarget | null;
  onClearReply?: () => void;
  onSend: ((content: string, replyToId?: string | null) => void) | (() => void);
  disabled?: boolean;
  placeholder?: string;
};

export function MessageComposer({
  value,
  onChangeText,
  replyTarget,
  onClearReply,
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: MessageComposerProps) {
  const [internalText, setInternalText] = useState("");
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  const isControlled = value !== undefined;
  const currentText = isControlled ? value : internalText;

  const handleTextChange = (newText: string) => {
    if (!isControlled) {
      setInternalText(newText);
    }
    onChangeText?.(newText);
  };

  const handleSend = () => {
    const trimmed = currentText.trim();
    if (!trimmed || disabled) return;

    if (onSend.length === 0) {
      (onSend as () => void)();
    } else {
      (onSend as (content: string, replyToId?: string | null) => void)(
        trimmed,
        replyTarget?.id,
      );
    }

    if (!isControlled) {
      setInternalText("");
    }
    onClearReply?.();
  };

  const canSend = Boolean(currentText.trim()) && !disabled;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
        },
      ]}
    >
      {/* Reply Preview Bar */}
      {replyTarget ? (
        <View
          style={[
            styles.replyBanner,
            {
              backgroundColor: palette.subtleBg,
              borderLeftColor: palette.tint,
            },
          ]}
        >
          <View style={styles.replyContent}>
            <Text
              style={[styles.replyHeader, { color: palette.tint }]}
              numberOfLines={1}
            >
              Replying to {replyTarget.senderName}
            </Text>
            <Text
              style={[styles.replySnippet, { color: palette.mutedText }]}
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
                tintColor={palette.mutedText}
                size={18}
              />
            </Pressable>
          )}
        </View>
      ) : null}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          value={currentText}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={palette.mutedText}
          multiline
          maxLength={1000}
          editable={!disabled}
          style={[
            styles.input,
            {
              backgroundColor: palette.card,
              color: palette.text,
              borderColor: palette.border,
            },
          ]}
        />

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend ? palette.tint : palette.subtleBg,
            },
          ]}
        >
          <SymbolView
            name={{
              ios: "arrow.up.circle.fill",
              android: "send",
              web: "send",
            }}
            tintColor={canSend ? "#ffffff" : palette.mutedText}
            size={22}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    lineHeight: 18,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
});
