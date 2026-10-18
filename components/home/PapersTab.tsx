import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { PaperItem } from "@/components/papers/PaperItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { usePapers } from "@/hooks/usePapers";
import { useUIStore } from "@/store/uiStore";
import type { PaperFilters } from "@/types/papers";

function pickPaperFilters(
  filters: ReturnType<typeof useUIStore.getState>["filters"],
): PaperFilters {
  return {
    grade: filters.grade,
    subject: filters.subject,
    medium: filters.medium,
    search: filters.search,
  };
}

export function PapersTab() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const filters = useUIStore((state) => state.filters);
  const query = usePapers(pickPaperFilters(filters));

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
        message="Unable to load papers."
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
          title="No papers found"
          subtitle="New papers will appear here soon."
        />
      }
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          <PaperItem paper={item} />
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
