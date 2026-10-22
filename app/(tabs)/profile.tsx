import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoginSheet } from "@/components/auth/LoginSheet";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { Text } from "@/components/Themed";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/auth-provider";

export default function ProfileScreen() {
  const { user, session } = useAuth();

  if (!user && !session?.user) {
    return <LoginSheet title="Profile" />;
  }

  return <ProfileContent />;
}

function ProfileContent() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const profileQuery = useProfile();
  const { user, session, signOut, refetch } = useAuth();

  const activeUser = session?.user ?? user ?? null;
  const profileImage = session?.user?.image ?? user?.image ?? null;

  const userProfile = {
    id: activeUser?.id ?? profileQuery.data?.id ?? "me",
    name: activeUser?.name || profileQuery.data?.name || "User",
    email: activeUser?.email || profileQuery.data?.email || "",
    imageUrl: profileImage,
    avatar: (activeUser?.name || profileQuery.data?.name || "US")
      .slice(0, 2)
      .toUpperCase(),
    bio: profileQuery.data?.bio,
    stats: profileQuery.data?.stats ?? {
      classes: 0,
      attendance: 0,
      teachers: 0,
    },
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={profileQuery.isRefetching}
            onRefresh={async () => {
              await Promise.all([refetch(), profileQuery.refetch()]);
            }}
            tintColor={palette.text}
          />
        }
      >
        <Text style={styles.title}>Profile</Text>

        {profileQuery.isLoading && !activeUser ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.text} />
          </View>
        ) : profileQuery.isError && !activeUser ? (
          <FieldError
            message="Unable to load your profile."
            onRetry={() => profileQuery.refetch()}
          />
        ) : (
          <>
            <ProfileHeader profile={userProfile} imageUrl={profileImage} />

            {session?.role ? (
              <View
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: palette.subtleBg,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Text style={[styles.roleLabel, { color: palette.muted }]}>
                  Role
                </Text>
                <Text style={styles.roleValue}>
                  {session.role.charAt(0).toUpperCase() + session.role.slice(1)}
                </Text>
              </View>
            ) : null}

            <ProfileSettings />
          </>
        )}

        <View style={styles.signOutWrap}>
          <Button
            label="Sign out"
            variant="ghost"
            fullWidth
            onPress={signOut}
            accessibilityLabel="Sign out of your account"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
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
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  roleValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  signOutWrap: {
    marginTop: 24,
  },
});
