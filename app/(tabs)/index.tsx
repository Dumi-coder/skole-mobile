import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text, View } from '@/components/Themed';
import { signInWithEmail } from '@/services/api';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signInWithEmail(trimmedEmail, trimmedPassword);
      Alert.alert('Signed in', 'Your session is now linked to the shared Fastify backend.');
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Sign in failed.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Skole mobile sync</Text>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue.</Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Enter your email"
          placeholderTextColor={palette.mutedText}
          style={[styles.input, { backgroundColor: palette.muted, color: palette.text, borderColor: palette.border }]}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor={palette.mutedText}
          secureTextEntry
          style={[styles.input, { backgroundColor: palette.muted, color: palette.text, borderColor: palette.border }]}
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <Pressable
          onPress={handleContinue}
          disabled={submitting}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.tint, opacity: pressed || submitting ? 0.9 : 1 },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: palette.background }]}>
            {submitting ? 'Signing in...' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  heroCard: {
    marginBottom: 16,
    padding: 22,
    borderRadius: 18,
    backgroundColor: '#0f1419',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#9aa4ae',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#dfe5eb',
  },
  formCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  label: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#d04545',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
});
