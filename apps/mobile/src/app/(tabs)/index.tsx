import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { api, type DashboardStats } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ErrorBanner } from '@/components/ui';
import { colors } from '@/theme';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      setStats(await api.getDashboardStats(token));
    } catch {
      setError('Impossible de charger le tableau de bord');
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const lastPub = stats?.lastPublishedAt
    ? new Date(stats.lastPublishedAt).toLocaleDateString('fr-FR')
    : '—';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <Text style={styles.hello}>As-salamu alaykum</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <ErrorBanner message={error} />

      <View style={styles.grid}>
        <Stat label="Publications" value={String(stats?.totalPosts ?? '—')} />
        <Stat label="Programmées" value={String(stats?.scheduledPosts ?? '—')} />
        <Stat label="Publiées" value={String(stats?.publishedPosts ?? '—')} />
        <Stat label="Dernière" value={lastPub} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lire Al-Fatiha"
        testID="open-fatiha"
        style={styles.hero}
        onPress={() => router.push('/surah/1')}
      >
        <Text style={styles.heroKicker}>Commencer la lecture</Text>
        <Text style={styles.heroArabic}>الفاتحة</Text>
        <Text style={styles.heroTitle}>Al-Fatiha</Text>
        <Text style={styles.heroMeta}>7 versets · texte, traduction FR/EN, tafsir</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Déconnexion"
        testID="logout"
        onPress={() => void logout()}
        style={styles.logout}
      >
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16, gap: 14 },
  hello: { fontSize: 26, fontWeight: '800', color: colors.ink },
  email: { color: colors.muted, marginTop: -8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statLabel: { color: colors.muted, fontSize: 13 },
  statValue: { marginTop: 6, fontSize: 22, fontWeight: '800', color: colors.ink },
  hero: {
    backgroundColor: colors.emerald800,
    borderRadius: 20,
    padding: 20,
  },
  heroKicker: { color: '#a7f3d0', fontSize: 13, fontWeight: '600' },
  heroArabic: {
    marginTop: 8,
    color: '#fff',
    fontSize: 36,
    textAlign: 'right',
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  heroMeta: { color: '#d1fae5', marginTop: 4 },
  logout: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: { color: colors.ink, fontWeight: '600' },
});
