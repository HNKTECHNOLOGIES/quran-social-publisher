import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { ApiError, useAuth } from '@/lib/auth';
import { ErrorBanner, PrimaryButton } from '@/components/ui';
import { colors } from '@/theme';

export default function LoginScreen() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('admin@qsp.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Redirect href="/(tabs)" />;

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <Text style={styles.mark}>☪</Text>
        <Text style={styles.title}>Quran</Text>
        <Text style={styles.subtitle}>Lecture, traduction et tafsir</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connexion</Text>
        <ErrorBanner message={error} />

        <Text style={styles.label}>Email</Text>
        <TextInput
          accessibilityLabel="Email"
          testID="login-email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          accessibilityLabel="Mot de passe"
          testID="login-password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <PrimaryButton
          testID="login-submit"
          label={submitting ? 'Connexion…' : 'Se connecter'}
          disabled={submitting || !email.trim() || password.length < 6}
          onPress={handleSubmit}
        />

        <Text style={styles.hint}>Compte local : admin@qsp.local</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.emerald800,
    justifyContent: 'center',
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mark: {
    fontSize: 36,
    color: '#fff',
  },
  title: {
    marginTop: 8,
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: '#d1fae5',
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: '#fff',
  },
  hint: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
});
