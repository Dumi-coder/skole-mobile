import { useQuery } from "@tanstack/react-query";
import { SymbolView } from "expo-symbols";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoginSheet } from "@/components/auth/LoginSheet";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { Text } from "@/components/Themed";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { getConversationById } from "@/services/messages";
import { useAuth } from "@/providers/auth-provider";

export default function ChatScreen() {
  const { user } = useAuth();

  if (!user) {
    return <LoginSheet title="Chat" />;
  }

  return <ChatContent />;
}

function ChatContent() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const [draft, setDraft] = useState("");

  const conversationQuery = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationById(String(conversationId)),
    enabled: Boolean(conversationId),
  });

  const conversation = conversationQuery.data;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: palette.border,
            backgroundColor: palette.background,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <SymbolView
            name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
            tintColor={palette.text}
            size={20}
          />
        </Pressable>
        <Text style={styles.headerTitle}>
          {conversation?.name ?? "Conversation"}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {conversationQuery.isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={palette.text} />
          </View>
        ) : conversationQuery.isError ? (
          <FieldError
            message="Unable to load this conversation."
            onRetry={() => conversationQuery.refetch()}
          />
        ) : (
          <FlatList
            data={conversation?.messages ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messages}
            renderItem={({ item }) => <MessageBubble message={item} />}
          />
        )}

        <MessageComposer
          value={draft}
          onChangeText={setDraft}
          onSend={() => setDraft("")}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  keyboard: {
    flex: 1,
  },
  messages: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
