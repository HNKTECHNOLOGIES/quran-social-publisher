import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { api, type VerseSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ErrorBanner, PrimaryButton } from '@/components/ui';
import { colors } from '@/theme';

export default function SearchScreen() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VerseSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function search(nextPage = 1) {
    if (!token || !query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.searchVerses(token, query.trim(), nextPage);
      setResults(data.results);
      setPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotal(data.totalResults);
    } catch {
      setResults([]);
      setError('Recherche impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={results}
      keyExtractor={(item) => item.verseKey}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <TextInput
            accessibilityLabel="Recherche de versets"
            testID="search-input"
            value={query}
            onChangeText={setQuery}
            placeholder="mercy, light, guidance…"
            placeholderTextColor={colors.muted}
            style={styles.input}
            onSubmitEditing={() => void search(1)}
          />
          <PrimaryButton
            testID="search-submit"
            label={loading ? 'Recherche…' : 'Rechercher'}
            disabled={loading || !query.trim()}
            onPress={() => void search(1)}
          />
          <Text style={styles.hint}>
            Index Quran.com : anglais (Saheeh) ou arabe. Exemple : mercy.
          </Text>
          <ErrorBanner message={error} />
          {total > 0 && (
            <Text style={styles.count}>
              {total} résultat{total > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Verset ${item.verseKey}`}
          testID={`verse-${item.verseKey}`}
          style={styles.card}
          onPress={() => router.push(`/verse/${item.surah}/${item.verseNumber}`)}
        >
          <Text style={styles.key}>{item.verseKey}</Text>
          <Text style={styles.arabic}>{item.arabicText}</Text>
          {item.englishSnippet ? (
            <Text style={styles.snippet} numberOfLines={2}>
              {item.englishSnippet}
            </Text>
          ) : null}
        </Pressable>
      )}
      ListFooterComponent={
        totalPages > 1 ? (
          <View style={styles.pager}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Page précédente"
              disabled={loading || page <= 1}
              onPress={() => void search(page - 1)}
              style={styles.pageBtn}
            >
              <Text>Précédent</Text>
            </Pressable>
            <Text style={styles.pageLabel}>
              {page} / {totalPages}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Page suivante"
              disabled={loading || page >= totalPages}
              onPress={() => void search(page + 1)}
              style={styles.pageBtn}
            >
              <Text>Suivant</Text>
            </Pressable>
          </View>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16, gap: 10 },
  header: { gap: 10, marginBottom: 8 },
  input: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  count: { color: colors.muted, fontSize: 13 },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  key: { color: colors.emerald700, fontWeight: '700', fontSize: 12 },
  arabic: {
    marginTop: 8,
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    color: colors.ink,
  },
  snippet: { marginTop: 8, color: '#334155', fontSize: 14 },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.paper,
  },
  pageLabel: { color: colors.muted },
});
