import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/Themed";
import { Avatar } from "@/components/ui/Avatar";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { FeedPost } from "@/types/feed";

export function FeedPostCard({ post }: { post: FeedPost }) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Collect all available image URLs
  const images: string[] = (
    post.imageUrls && post.imageUrls.length > 0
      ? post.imageUrls
      : post.imageUrl
        ? [post.imageUrl]
        : []
  ).filter((url) => Boolean(url && url.trim().length > 0));

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth <= 0) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / containerWidth);
    if (index !== activeImageIndex && index >= 0 && index < images.length) {
      setActiveImageIndex(index);
    }
  };

  const handleImageLoadStart = (url: string) => {
    setLoadingMap((prev) => ({ ...prev, [url]: true }));
    setErrorMap((prev) => ({ ...prev, [url]: false }));
  };

  const handleImageLoadEnd = (url: string) => {
    setLoadingMap((prev) => ({ ...prev, [url]: false }));
  };

  const handleImageError = (url: string) => {
    setLoadingMap((prev) => ({ ...prev, [url]: false }));
    setErrorMap((prev) => ({ ...prev, [url]: true }));
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      {/* Author and metadata header */}
      <View style={styles.headerRow}>
        <Avatar
          size={42}
          label={
            post.authorAvatar ??
            (post.author ? post.author.slice(0, 2).toUpperCase() : "SK")
          }
          imageUrl={post.avatarUrl}
          backgroundColor={palette.subtleBg}
          textColor={palette.text}
        />
        <View style={styles.metaWrap}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>
            {post.subject ? post.subject : ""}
            {post.subject && post.timeLabel ? " • " : ""}
            {post.timeLabel}
          </Text>
        </View>
      </View>

      {/* Post text content */}
      {post.text ? <Text style={styles.text}>{post.text}</Text> : null}

      {/* Images section */}
      {images.length === 1 && (
        <View
          style={[
            styles.mediaFrame,
            { backgroundColor: palette.subtleBg, borderColor: palette.border },
          ]}
        >
          <Pressable
            style={styles.pressableMedia}
            onPress={() => setSelectedImage(images[0])}
            accessibilityRole="button"
            accessibilityLabel={`Enlarge post image by ${post.author}`}
          >
            {errorMap[images[0]] ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorTitle, { color: palette.muted }]}>
                  Image could not be loaded
                </Text>
                <Pressable
                  style={[
                    styles.retryButton,
                    { borderColor: palette.border },
                  ]}
                  onPress={() => {
                    handleImageLoadStart(images[0]);
                  }}
                >
                  <Text style={[styles.retryText, { color: palette.tint }]}>
                    Retry
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Image
                source={{ uri: images[0] }}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => handleImageLoadStart(images[0])}
                onLoadEnd={() => handleImageLoadEnd(images[0])}
                onError={() => handleImageError(images[0])}
                accessibilityLabel={`Post image by ${post.author}`}
              />
            )}

            {loadingMap[images[0]] && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color={palette.tint} />
              </View>
            )}
          </Pressable>
        </View>
      )}

      {images.length > 1 && (
        <View
          style={[
            styles.mediaFrame,
            { backgroundColor: palette.subtleBg, borderColor: palette.border },
          ]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0 && Math.abs(w - containerWidth) > 1) {
              setContainerWidth(w);
            }
          }}
        >
          {containerWidth > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ width: containerWidth }}
            >
              {images.map((url, idx) => (
                <Pressable
                  key={url + idx}
                  style={[styles.carouselSlide, { width: containerWidth }]}
                  onPress={() => setSelectedImage(url)}
                  accessibilityRole="button"
                  accessibilityLabel={`Enlarge image ${idx + 1} of ${images.length}`}
                >
                  {errorMap[url] ? (
                    <View style={styles.errorContainer}>
                      <Text
                        style={[styles.errorTitle, { color: palette.muted }]}
                      >
                        Image could not be loaded
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: url }}
                      style={[styles.image, { width: containerWidth }]}
                      resizeMode="cover"
                      onLoadStart={() => handleImageLoadStart(url)}
                      onLoadEnd={() => handleImageLoadEnd(url)}
                      onError={() => handleImageError(url)}
                      accessibilityLabel={`Post image ${idx + 1} by ${post.author}`}
                    />
                  )}

                  {loadingMap[url] && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="small" color={palette.tint} />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={palette.tint} />
            </View>
          )}

          {/* Indicator pill showing "1 / N" */}
          <View style={styles.indicatorBadge}>
            <Text style={styles.indicatorText}>
              {activeImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      )}

      {/* Full screen lightbox modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
        statusBarTranslucent
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.modalHeader}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
              accessibilityRole="button"
              accessibilityLabel="Close image preview"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.modalContent}
            onPress={() => setSelectedImage(null)}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullScreenImage}
                resizeMode="contain"
                accessibilityLabel="Enlarged post image"
              />
            ) : null}
          </Pressable>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaWrap: {
    flex: 1,
    marginLeft: 12,
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
  mediaFrame: {
    width: "100%",
    height: 240,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 12,
    position: "relative",
  },
  pressableMedia: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  carouselSlide: {
    height: 240,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorTitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  indicatorBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  indicatorText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.94)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
