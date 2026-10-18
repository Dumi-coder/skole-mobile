import { Image, StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { FeedPost } from "@/types/feed";

export function FeedPostCard({ post }: { post: FeedPost }) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: palette.subtleBg }]}>
          <Text style={[styles.avatarText, { color: palette.text }]}>
            {post.authorAvatar ?? post.author.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.metaWrap}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>
            {post.subject} • {post.timeLabel}
          </Text>
        </View>
      </View>
      <Text style={styles.text}>{post.text}</Text>
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`Post image by ${post.author}`}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  metaWrap: {
    flex: 1,
  },
  author: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 12,
  },
});
