import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type MessageComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend?: () => void;
  placeholder?: string;
};

export function MessageComposer({
  value,
  onChangeText,
  onSend,
  placeholder = "Write a message",
}: MessageComposerProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: palette.card, borderTopColor: palette.border },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        accessibilityLabel="Message input"
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
        onPress={onSend}
        style={[styles.sendButton, { backgroundColor: palette.foreground }]}
      >
        <Text style={[styles.sendText, { color: palette.onForeground }]}>
          Send
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
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
