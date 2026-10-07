import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text, View } from '@/components/Themed';
import { apiClient, getCurrentSession } from '@/services/api';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const [profileName, setProfileName] = useState('Profile pending');
  const [profileMeta, setProfileMeta] = useState('No user data loaded yet.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const session = await getCurrentSession();

        if (!session) {
          if (active) {
            setProfileName('Profile pending');
            setProfileMeta('No user data loaded yet.');
            setLoading(false);
          }
          return;
        }

        const data = await apiClient.getProfile('cookie-session');

        if (!active) {
          return;
        }

        const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name || 'Student profile';
        setProfileName(fullName || 'Student profile');
        setProfileMeta(data.email ?? session.userId);
      } catch {
        if (active) {
          setProfileName('Profile pending');
          setProfileMeta('Unable to load profile data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.headerCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={styles.avatar}>{loading ? '?' : profileName.charAt(0).toUpperCase() || '?'}</Text>
        <Text style={styles.name}>{profileName}</Text>
        <Text style={[styles.meta, { color: palette.mutedText }]}>{profileMeta}</Text>
      </View>

      <View style={[styles.statsRow, { borderColor: palette.border }]}>
        <View style={[styles.statCard, { backgroundColor: palette.muted, borderColor: palette.border }]}> 
          <Text style={styles.statValue}>0</Text>
          <Text style={[styles.statLabel, { color: palette.mutedText }]}>Classes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: palette.muted, borderColor: palette.border }]}> 
          <Text style={styles.statValue}>0%</Text>
          <Text style={[styles.statLabel, { color: palette.mutedText }]}>Attendance</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: palette.muted, borderColor: palette.border }]}> 
          <Text style={styles.statValue}>0</Text>
          <Text style={[styles.statLabel, { color: palette.mutedText }]}>Teachers</Text>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={styles.sectionTitle}>Profile details</Text>
        <Text style={[styles.detailRow, { color: palette.mutedText }]}>
          {loading ? 'Loading from the shared Fastify API…' : 'Profile data is now loaded through the shared API contract.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  headerCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0f1419',
    color: '#ffffff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  panel: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
});
