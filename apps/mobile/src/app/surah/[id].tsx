import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { api, type Chapter, type VerseSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ErrorBanner, LoadingScreen } from '@/components/ui';
import { colors, headerOptions } from '@/theme';

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surah = Number(id);
  const { token } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<VerseSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!token || !Number.isFinite(surah)) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');
      try {
        const data = await api.getVersesBySurah(token, surah, nextPage);
        setVerses((current) => (append ? [...current, ...data.verses] : data.verses));
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch {
        setError('Impossible de charger les versets');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [surah, token],
  );

  useEffect(() => {
    if (!token) return;
    api
      .getChapters(token)
      .then((chapters) => setChapter(chapters.find((item) => item.id === surah) ?? null))
      .catch(() => undefined);
    void loadPage(1, false);
  }, [loadPage, surah, token]);

  if (loading && verses.length === 0) {
    return <LoadingScreen label="Chargement des versets…" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          ...headerOptions,
          headerShown: true,
          title: chapter?.translatedName ?? `Sourate ${surah}`,
        }}
      />
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={verses}
        keyExtractor={(item) => item.verseKey}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.arabic}>{chapter?.nameArabic}</Text>
            <Text style={styles.meta}>
              {chapter ? `${chapter.versesCount} versets` : `Sourate ${surah}`}
            </Text>
            <ErrorBanner message={error} />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Verset ${item.verseNumber}`}
            testID={`ayah-${item.verseNumber}`}
            style={styles.card}
            onPress={() => router.push(`/verse/${item.surah}/${item.verseNumber}`)}
          >
            <Text style={styles.number}>{item.verseNumber}</Text>
            <View style={styles.body}>
              <Text style={styles.verse}>{item.arabicText}</Text>
              {item.englishSnippet ? (
                <Text style={styles.snippet} numberOfLines={2}>
                  {item.englishSnippet}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          page < totalPages ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Charger plus de versets"
              testID="load-more"
              style={styles.more}
              disabled={loadingMore}
              onPress={() => void loadPage(page + 1, true)}
            >
              <Text style={styles.moreText}>
                {loadingMore ? 'Chargement…' : 'Versets suivants'}
              </Text>
            </Pressable>
          ) : undefined
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16 },
  header: { marginBottom: 12, gap: 4 },
  arabic: { fontSize: 32, textAlign: 'right', color: colors.emerald900 },
  meta: { color: colors.muted },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  number: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 28,
    backgroundColor: colors.emerald50,
    color: colors.emerald800,
    fontWeight: '800',
  },
  body: { flex: 1 },
  verse: { fontSize: 22, lineHeight: 40, textAlign: 'right', color: colors.ink },
  snippet: { marginTop: 6, color: '#334155', fontSize: 14 },
  more: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.emerald50,
  },
  moreText: { color: colors.emerald800, fontWeight: '700' },
});
