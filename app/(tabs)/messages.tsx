import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { router } from "expo-router";

import { ConversationList } from "@/components/messages/ConversationList";
import { NewConversationModal } from "@/components/messages/NewConversationModal";
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
  const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <FlatList
        data={conversationsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Messages</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New conversation"
              onPress={() => setIsNewChatModalVisible(true)}
              style={[
                styles.newChatButton,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              <SymbolView
                name={{ ios: "square.and.pencil", android: "edit", web: "edit" }}
                tintColor={palette.text}
                size={18}
              />
            </Pressable>
          </View>
        }
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

      <NewConversationModal
        visible={isNewChatModalVisible}
        onClose={() => setIsNewChatModalVisible(false)}
        onCreateDirect={(contact) => {
          setIsNewChatModalVisible(false);
          router.push({
            pathname: "/chat/[conversationId]" as any,
            params: { conversationId: "c-1" },
          });
        }}
        onCreateGroup={(name) => {
          setIsNewChatModalVisible(false);
          router.push({
            pathname: "/chat/[conversationId]" as any,
            params: { conversationId: "c-1" },
          });
        }}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
