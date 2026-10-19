import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { api, type Chapter } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ErrorBanner, LoadingScreen } from '@/components/ui';
import { placeLabel } from '@/lib/html';
import { colors } from '@/theme';

export default function SurahsScreen() {
  const { token } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .getChapters(token)
      .then(setChapters)
      .catch(() => setError('Impossible de charger les sourates'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingScreen label="Chargement des sourates…" />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={chapters}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={error ? <ErrorBanner message={error} /> : undefined}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sourate ${item.id} ${item.translatedName}`}
          testID={`surah-${item.id}`}
          style={styles.row}
          onPress={() => router.push(`/surah/${item.id}`)}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.id}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.name}>{item.translatedName}</Text>
            <Text style={styles.sub}>
              {item.versesCount} versets · {placeLabel(item.revelationPlace)}
            </Text>
          </View>
          <Text style={styles.arabic}>{item.nameArabic}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 12, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.emerald50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.emerald800, fontWeight: '800' },
  meta: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  sub: { color: colors.muted, marginTop: 2, fontSize: 12 },
  arabic: { fontSize: 20, color: colors.emerald800 },
});
