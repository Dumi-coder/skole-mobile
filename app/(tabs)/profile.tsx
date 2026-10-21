import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { Text } from "@/components/Themed";
import { FieldError } from "@/components/ui/FieldError";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useProfile } from "@/hooks/useProfile";

// TODO(auth)

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const profileQuery = useProfile();

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
            onRefresh={() => profileQuery.refetch()}
            tintColor={palette.text}
          />
        }
      >
        <Text style={styles.title}>Profile</Text>

        {profileQuery.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.text} />
          </View>
        ) : profileQuery.isError ? (
          <FieldError
            message="Unable to load your profile."
            onRetry={() => profileQuery.refetch()}
          />
        ) : profileQuery.data ? (
          <>
            <ProfileHeader profile={profileQuery.data} />
            <ProfileSettings />
          </>
        ) : null}
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
});
