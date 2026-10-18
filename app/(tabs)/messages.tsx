import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConversationList } from "@/components/messages/ConversationList";
import { Text } from "@/components/Themed";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useConversations } from "@/hooks/useConversations";

export default function MessagesScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const conversationsQuery = useConversations();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <FlatList
        data={conversationsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Messages</Text>}
        refreshControl={
          <RefreshControl
            refreshing={conversationsQuery.isRefetching}
            onRefresh={() => conversationsQuery.refetch()}
            tintColor={palette.text}
          />
        }
        ListEmptyComponent={
          conversationsQuery.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={palette.text} />
            </View>
          ) : conversationsQuery.isError ? (
            <FieldError
              message="Unable to load your conversations."
              onRetry={() => conversationsQuery.refetch()}
            />
          ) : (
            <EmptyState
              title="No conversations"
              subtitle="Your chats will appear here."
            />
          )
        }
        renderItem={({ item }) => <ConversationList conversation={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    marginBottom: 16,
  },
  loading: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
