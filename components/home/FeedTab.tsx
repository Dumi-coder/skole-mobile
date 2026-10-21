import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useFeed } from "@/hooks/useFeed";

export function FeedTab() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const query = useFeed();

  if (query.isLoading && query.items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.text} />
      </View>
    );
  }

  if (query.isError) {
    return (
      <FieldError
        message="Unable to load feed."
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={query.items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching && !query.isFetchingNextPage}
          onRefresh={() => query.refetch()}
          tintColor={palette.text}
        />
      }
      ListEmptyComponent={
        <EmptyState
          title="No posts yet"
          subtitle="Your community updates will appear here."
        />
      }
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          <FeedPostCard post={item} />
        </View>
      )}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        query.isFetchingNextPage ? (
          <ActivityIndicator
            style={styles.footerSpinner}
            color={palette.text}
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  cardWrap: {
    marginBottom: 14,
  },
  centered: {
    paddingVertical: 32,
    alignItems: "center",
  },
  footerSpinner: {
    paddingVertical: 16,
  },
});
