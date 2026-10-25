import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { TeacherCard } from "@/components/teachers/TeacherCard";
import { Text } from "@/components/Themed";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useTeachers } from "@/hooks/useTeachers";
import { useUIStore } from "@/store/uiStore";
import type { TeacherFilters } from "@/types/teacher";

function pickTeacherFilters(
  filters: ReturnType<typeof useUIStore.getState>["filters"],
): TeacherFilters {
  return {
    grade: filters.grade,
    subject: filters.subject,
    medium: filters.medium,
    location: filters.location,
    search: filters.search,
  };
}

export function TeachersTab() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const filters = useUIStore((state) => state.filters);
  const query = useTeachers(pickTeacherFilters(filters));

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
        message="Unable to load teachers."
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
      ListHeaderComponent={
        query.totalCount > 0 ? (
          <Text style={[styles.count, { color: palette.muted }]}>
            {query.totalCount} teachers found
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          title="No teachers found"
          subtitle="Try a different filter combination."
        />
      }
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          <TeacherCard teacher={item} />
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
  count: {
    fontSize: 13,
    marginBottom: 12,
    fontWeight: "600",
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
