import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { api, type VerseDetail } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ErrorBanner, LoadingScreen } from '@/components/ui';
import { htmlToText } from '@/lib/html';
import { colors, headerOptions } from '@/theme';

export default function VerseScreen() {
  const params = useLocalSearchParams<{ surah: string; ayah: string }>();
  const surah = Number(params.surah);
  const ayah = Number(params.ayah);
  const { token } = useAuth();
  const [detail, setDetail] = useState<VerseDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !Number.isFinite(surah) || !Number.isFinite(ayah)) return;
    setLoading(true);
    api
      .getVerseDetail(token, surah, ayah)
      .then(setDetail)
      .catch(() => setError('Impossible de charger ce verset'))
      .finally(() => setLoading(false));
  }, [ayah, surah, token]);

  if (loading) return <LoadingScreen label="Chargement du verset…" />;

  return (
    <>
      <Stack.Screen
        options={{
          ...headerOptions,
          headerShown: true,
          title: detail?.verseKey ?? `${surah}:${ayah}`,
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <ErrorBanner message={error} />
        {detail && (
          <>
            <Text style={styles.arabic}>{detail.arabicText}</Text>
            <View style={styles.card}>
              <Text style={styles.kicker}>Français</Text>
              <Text style={styles.body}>{detail.frenchTranslation}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.kicker}>English</Text>
              <Text style={styles.body}>{detail.englishTranslation}</Text>
            </View>
            <Text style={styles.section}>Tafsirs</Text>
            {detail.tafsirs.map((tafsir) => (
              <View key={tafsir.source} style={styles.card}>
                <View style={styles.tafsirHead}>
                  <Text style={styles.tafsirTitle}>{tafsir.label}</Text>
                  {!tafsir.available && <Text style={styles.badge}>indisponible</Text>}
                </View>
                <Text style={styles.body}>
                  {tafsir.available && tafsir.content
                    ? htmlToText(tafsir.content)
                    : (tafsir.message ?? 'Tafsir non disponible pour ce verset.')}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16, gap: 12 },
  arabic: {
    fontSize: 30,
    lineHeight: 52,
    textAlign: 'right',
    color: colors.ink,
    backgroundColor: colors.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  kicker: {
    color: colors.emerald700,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  body: { color: '#1e293b', fontSize: 16, lineHeight: 24 },
  section: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 4 },
  tafsirHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  tafsirTitle: { fontWeight: '700', color: colors.emerald800, flex: 1 },
  badge: {
    backgroundColor: colors.amberBg,
    color: colors.amber,
    overflow: 'hidden',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
  },
});
