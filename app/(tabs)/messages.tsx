import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { useLocalSearchParams } from "expo-router";

import { LoginSheet } from "@/components/auth/LoginSheet";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { NewConversationModal } from "@/components/messages/NewConversationModal";
import { ProfileAvatar } from "@/components/messages/ProfileAvatar";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useAuth } from "@/providers/auth-provider";
import {
  chatApi,
  type ApiConversation,
  type ApiMessage,
} from "@/services/api";

type FilterTab = "all" | "direct" | "class";

export default function MessagesScreen() {
  const { user } = useAuth();

  if (!user) {
    return <LoginSheet title="Messages" />;
  }

  return <MessagesContent />;
}

function MessagesContent() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  // Navigation & Active state
  const [activeConversation, setActiveConversation] =
    useState<ApiConversation | null>(null);
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [messages, setMessages] = useState<ApiMessage[]>([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [replyTarget, setReplyTarget] = useState<{
    id: string;
    senderName: string;
    body: string;
  } | null>(null);
  const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const handledStartChatRef = useRef<string | null>(null);
  const params = useLocalSearchParams<{
    startChatWith?: string;
    name?: string;
  }>();

  // Manual / on-demand message loader
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const msgs = await chatApi.getMessages(conversationId);
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
  }, []);

  const handleSelectConversation = useCallback(
    (conversation: ApiConversation) => {
      setActiveConversation(conversation);
      setReplyTarget(null);
      setMessages([]);
      void loadMessages(conversation.id);

      // Mark as read locally
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c,
        ),
      );
    },
    [loadMessages],
  );

  const handleBackToList = useCallback(() => {
    setActiveConversation(null);
    setReplyTarget(null);
    setMessages([]);
    // Quietly reload conversations to update last preview and order without spinner
    void chatApi.getConversations().then((data) => {
      setConversations(data);
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    let isMounted = true;
    void chatApi.getConversations().then((data) => {
      if (isMounted) {
        setConversations(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle direct message navigation from teacher profile
  useEffect(() => {
    const targetId = params.startChatWith;
    if (!targetId || handledStartChatRef.current === targetId) return;

    let isMounted = true;
    void (async () => {
      try {
        const list = await chatApi.getConversations();
        if (!isMounted) return;

        setConversations(list);

        const existing = list.find(
          (c) =>
            c.type === "direct" &&
            (c.teacherId === targetId || c.id === targetId),
        );

        if (existing) {
          handledStartChatRef.current = targetId;
          handleSelectConversation(existing);
          return;
        }

        const conv = await chatApi.createConversation({
          type: "direct",
          teacherId: targetId,
          name: params.name ? `Teacher: ${params.name}` : "Teacher",
        });

        if (isMounted) {
          handledStartChatRef.current = targetId;
          setConversations((prev) => [
            conv,
            ...prev.filter((c) => c.id !== conv.id),
          ]);
          handleSelectConversation(conv);
        }
      } catch {
        // Handle error silently
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [params.startChatWith, params.name, handleSelectConversation]);

  const handleSendMessage = async (
    content: string,
    replyToId?: string | null,
  ) => {
    if (!activeConversation) return;
    setIsSending(true);

    const repliedTarget = replyToId
      ? messages.find((m) => m.id === replyToId)
      : null;

    // Optimistic message
    const tempMessage: ApiMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: "current-user",
      senderName: "You",
      content,
      createdAt: new Date().toISOString(),
      replyToId: replyToId ?? null,
      outgoing: true,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            senderName: replyTarget.senderName,
            body: replyTarget.body,
          }
        : repliedTarget
          ? {
              id: repliedTarget.id,
              senderName: repliedTarget.senderName || "User",
              body: repliedTarget.content,
            }
          : null,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setReplyTarget(null);

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const sent = await chatApi.sendMessage(
        activeConversation.id,
        content,
        replyToId,
      );

      // Replace optimistic message with server returned message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? sent : m)),
      );

      // Update preview in conversation list and bump to top
      setConversations((prev) => {
        const found = prev.find((c) => c.id === activeConversation.id);
        const updated: ApiConversation = {
          ...(found || activeConversation),
          lastMessagePreview: content,
          lastMessageAt: sent.createdAt,
          timeLabel: "Now",
        };
        return [updated, ...prev.filter((c) => c.id !== activeConversation.id)];
      });

      // Update activeConversation snapshot
      setActiveConversation((prev) =>
        prev && prev.id === activeConversation.id
          ? {
              ...prev,
              lastMessagePreview: content,
              lastMessageAt: sent.createdAt,
              timeLabel: "Now",
            }
          : prev,
      );
    } catch {
      // Message remains in thread via fallback store
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateDirect = async (contact: {
    id: string;
    name: string;
    role: string;
  }) => {
    // Check if conversation already exists with this contact
    const existing = conversations.find(
      (c) =>
        c.type === "direct" &&
        (c.teacherId === contact.id ||
          c.studentId === contact.id ||
          c.name?.toLowerCase().trim() === contact.name.toLowerCase().trim()),
    );

    if (existing) {
      handleSelectConversation(existing);
      return;
    }

    const isTeacher = contact.role.toLowerCase() === "teacher";
    const newConv = await chatApi.createConversation({
      type: "direct",
      teacherId: isTeacher ? contact.id : undefined,
      studentId: !isTeacher ? contact.id : undefined,
      name: contact.name,
    });
    setConversations((prev) => [
      newConv,
      ...prev.filter((c) => c.id !== newConv.id),
    ]);
    handleSelectConversation(newConv);
  };

  const handleCreateGroup = async (name: string) => {
    const trimmed = name.trim();
    const existing = conversations.find(
      (c) =>
        c.type === "class" &&
        c.name?.toLowerCase().trim() === trimmed.toLowerCase(),
    );
    if (existing) {
      handleSelectConversation(existing);
      return;
    }

    const newConv = await chatApi.createConversation({
      type: "class",
      name: trimmed,
    });
    setConversations((prev) => [
      newConv,
      ...prev.filter((c) => c.id !== newConv.id),
    ]);
    handleSelectConversation(newConv);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Tab filter
    if (filterTab === "direct" && c.type !== "direct") return false;
    if (filterTab === "class" && c.type !== "class") return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchSnippet = c.lastMessagePreview?.toLowerCase().includes(q);
      const matchTeacher = c.teacherName?.toLowerCase().includes(q);
      return matchName || matchSnippet || matchTeacher;
    }
    return true;
  });

  // -------------------------------------------------------------
  // RENDER: Active Chat Thread View
  // -------------------------------------------------------------
  if (activeConversation) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={[styles.container, { backgroundColor: palette.background }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          {/* Active Chat Header */}
          <View
            style={[
              styles.chatHeader,
              {
                backgroundColor: palette.card,
                borderBottomColor: palette.border,
              },
            ]}
          >
            <Pressable
              hitSlop={12}
              onPress={handleBackToList}
              style={styles.backButton}
            >
              <SymbolView
                name={{
                  ios: "chevron.left",
                  android: "arrow_back",
                  web: "arrow_back",
                }}
                tintColor={palette.text}
                size={22}
              />
            </Pressable>

            <ProfileAvatar name={activeConversation.name} size={38} />

            <View style={styles.chatHeaderInfo}>
              <Text
                style={[styles.chatHeaderName, { color: palette.text }]}
                numberOfLines={1}
              >
                {activeConversation.name}
              </Text>
              <Text
                style={[styles.chatHeaderSubtitle, { color: palette.mutedText }]}
                numberOfLines={1}
              >
                {activeConversation.type === "class"
                  ? `${activeConversation.memberCount || 18} members • Class Group`
                  : activeConversation.teacherName
                    ? `Teacher • ${activeConversation.teacherName}`
                    : "Direct message"}
              </Text>
            </View>

            <Pressable
              hitSlop={10}
              onPress={() => loadMessages(activeConversation.id)}
              style={styles.headerActionBtn}
            >
              <SymbolView
                name={{
                  ios: "arrow.clockwise",
                  android: "refresh",
                  web: "refresh",
                }}
                tintColor={palette.mutedText}
                size={18}
              />
            </Pressable>
          </View>

          {/* Messages Stream */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageListContent}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                showSenderName={activeConversation.type === "class"}
                onReply={(msg) => {
                  setReplyTarget({
                    id: msg.id,
                    senderName: msg.senderName || "User",
                    body: msg.content || msg.text || "",
                  });
                }}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyMessagesContainer}>
                <View
                  style={[
                    styles.emptyIconCircle,
                    { backgroundColor: palette.subtleBg },
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: "bubble.left.and.bubble.right",
                      android: "message",
                      web: "message",
                    }}
                    tintColor={palette.mutedText}
                    size={28}
                  />
                </View>
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  No messages yet
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: palette.mutedText }]}
                >
                  Send a message to start this discussion.
                </Text>
              </View>
            }
          />

          {/* Bottom Composer */}
          <MessageComposer
            replyTarget={replyTarget}
            onClearReply={() => setReplyTarget(null)}
            onSend={handleSendMessage}
            disabled={isSending}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Conversations Master List
  // -------------------------------------------------------------
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.screenTitle, { color: palette.text }]}>
          Messages
        </Text>
        <Pressable
          hitSlop={8}
          onPress={() => setIsNewChatModalVisible(true)}
          style={[
            styles.newChatBtn,
            { backgroundColor: palette.tint },
          ]}
        >
          <SymbolView
            name={{ ios: "plus", android: "add", web: "add" }}
            tintColor="#ffffff"
            size={18}
          />
          <Text style={styles.newChatBtnText}>New</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View
        style={[
          styles.filterRow,
          { backgroundColor: palette.subtleBg, borderColor: palette.border },
        ]}
      >
        <Pressable
          onPress={() => setFilterTab("all")}
          style={[
            styles.filterTab,
            filterTab === "all" && [
              styles.filterTabActive,
              { backgroundColor: palette.card },
            ],
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              {
                color: filterTab === "all" ? palette.text : palette.mutedText,
                fontWeight: filterTab === "all" ? "700" : "500",
              },
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterTab("direct")}
          style={[
            styles.filterTab,
            filterTab === "direct" && [
              styles.filterTabActive,
              { backgroundColor: palette.card },
            ],
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              {
                color:
                  filterTab === "direct" ? palette.text : palette.mutedText,
                fontWeight: filterTab === "direct" ? "700" : "500",
              },
            ]}
          >
            Direct
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterTab("class")}
          style={[
            styles.filterTab,
            filterTab === "class" && [
              styles.filterTabActive,
              { backgroundColor: palette.card },
            ],
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              {
                color: filterTab === "class" ? palette.text : palette.mutedText,
                fontWeight: filterTab === "class" ? "700" : "500",
              },
            ]}
          >
            Classes
          </Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <SymbolView
            name={{
              ios: "magnifyingglass",
              android: "search",
              web: "search",
            }}
            tintColor={palette.mutedText}
            size={16}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search conversations..."
            placeholderTextColor={palette.mutedText}
            style={[styles.searchInput, { color: palette.text }]}
          />
          {searchQuery ? (
            <Pressable hitSlop={8} onPress={() => setSearchQuery("")}>
              <SymbolView
                name={{
                  ios: "xmark.circle.fill",
                  android: "close",
                  web: "close",
                }}
                tintColor={palette.mutedText}
                size={16}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Conversation List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={palette.tint}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleSelectConversation(item)}
            style={({ pressed }) => [
              styles.conversationRow,
              {
                backgroundColor: pressed
                  ? palette.subtleBg
                  : palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <ProfileAvatar name={item.name} size={46} />

            <View style={styles.conversationInfo}>
              <View style={styles.convTitleRow}>
                <Text
                  style={[styles.convName, { color: palette.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.convTime, { color: palette.mutedText }]}
                >
                  {item.timeLabel || ""}
                </Text>
              </View>

              <View style={styles.convSubtitleRow}>
                <Text
                  style={[
                    styles.convPreview,
                    {
                      color:
                        (item.unreadCount ?? 0) > 0
                          ? palette.text
                          : palette.mutedText,
                      fontWeight:
                        (item.unreadCount ?? 0) > 0 ? "700" : "400",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessagePreview || "No messages yet"}
                </Text>

                {item.type === "class" && (
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: palette.subtleBg,
                        borderColor: palette.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.typeBadgeText, { color: palette.mutedText }]}
                    >
                      Class
                    </Text>
                  </View>
                )}

                {(item.unreadCount ?? 0) > 0 ? (
                  <View
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: palette.tint },
                    ]}
                  >
                    <Text style={styles.unreadBadgeText}>
                      {item.unreadCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: palette.subtleBg },
              ]}
            >
              <SymbolView
                name={{
                  ios: "bubble.left.and.exclamationmark.bubble.right",
                  android: "message",
                  web: "message",
                }}
                tintColor={palette.mutedText}
                size={32}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>
              {searchQuery ? "No conversations found" : "No messages yet"}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: palette.mutedText }]}
            >
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different keyword.`
                : "Connect with certified teachers, mentors, or join an active class discussion."}
            </Text>
          </View>
        }
      />

      {/* New Conversation Modal */}
      <NewConversationModal
        visible={isNewChatModalVisible}
        onClose={() => setIsNewChatModalVisible(false)}
        onCreateDirect={handleCreateDirect}
        onCreateGroup={handleCreateGroup}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
  },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  newChatBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 9,
  },
  filterTabActive: {
    ...Platform.select({
      web: {
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.08)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  filterTabText: {
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  convTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  convName: {
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
  convTime: {
    fontSize: 11,
    fontWeight: "500",
  },
  convSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  convPreview: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  unreadBadge: {
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  chatHeaderSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  headerActionBtn: {
    padding: 6,
  },
  messageListContent: {
    paddingVertical: 12,
  },
  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyMessagesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});
