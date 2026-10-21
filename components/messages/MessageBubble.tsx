import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { Message } from "@/types/message";

export function MessageBubble({ message }: { message: Message }) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const isMine = message.sender === "me";

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
          {message.text}
        </Text>
        <Text
          style={[
            styles.time,
            {
              color: isMine ? palette.onForeground : palette.muted,
              opacity: isMine ? 0.75 : 1,
            },
          ]}
        >
          {message.time}
        </Text>
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
