import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { Avatar } from "@/components/ui/Avatar";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { UserProfile } from "@/types/profile";

export function ProfileHeader({
  profile,
  imageUrl,
}: {
  profile: UserProfile;
  imageUrl?: string | null;
}) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const photoUrl = imageUrl ?? profile.imageUrl ?? null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={styles.avatarWrap}>
        <Avatar
          imageUrl={photoUrl}
          label={profile.avatar ?? profile.name.slice(0, 2).toUpperCase()}
          size={80}
        />
      </View>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={[styles.email, { color: palette.muted }]}>
        {profile.email}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrap: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
});
