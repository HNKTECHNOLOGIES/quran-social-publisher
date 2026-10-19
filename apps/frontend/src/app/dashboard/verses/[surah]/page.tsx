'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, Chapter, VerseSummary } from '@/lib/api';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function SurahPage() {
  const params = useParams<{ surah: string }>();
  const surah = Number(params.surah);
  const router = useRouter();
  const { token } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<VerseSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [verseNumber, setVerseNumber] = useState('1');
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

  function openVerse(event: FormEvent) {
    event.preventDefault();
    const number = Number(verseNumber);
    if (!Number.isFinite(number) || number < 1) return;
    if (chapter && number > chapter.versesCount) {
      setError(`Cette sourate ne contient que ${chapter.versesCount} versets`);
      return;
    }
    router.push(`/dashboard/verses/${surah}/${number}`);
  }

  return (
    <div>
      <ScreenHeader
        title={chapter?.translatedName ?? `Sourate ${surah}`}
        backHref="/dashboard/verses"
      />
      <div className="space-y-3 p-4">
        <p className="font-arabic text-right text-3xl text-emerald-900">
          {chapter?.nameArabic}
        </p>
        <p className="text-sm text-slate-500">
          {chapter ? `${chapter.versesCount} versets` : `Sourate ${surah}`}
        </p>

        <form onSubmit={openVerse} className="flex gap-2">
          <input
            aria-label="Numéro du verset"
            type="number"
            min={1}
            value={verseNumber}
            onChange={(event) => setVerseNumber(event.target.value)}
            className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="flex-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
          >
            Aller au verset
          </button>
        </form>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {loading && <p className="text-sm text-slate-500">Chargement des versets…</p>}

        <ul className="space-y-2">
          {verses.map((verse) => (
            <li key={verse.verseKey}>
              <Link
                href={`/dashboard/verses/${verse.surah}/${verse.verseNumber}`}
                className="block rounded-2xl border border-slate-200 bg-white p-3"
              >
                <span className="text-xs font-bold text-emerald-700">{verse.verseKey}</span>
                <p className="font-arabic mt-2 text-right text-2xl leading-loose text-slate-900">
                  {verse.arabicText}
                </p>
                {verse.englishSnippet && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {verse.englishSnippet}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {page < totalPages && (
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadPage(page + 1, true)}
            className="w-full rounded-xl bg-emerald-50 py-3 text-sm font-semibold text-emerald-800 disabled:opacity-50"
          >
            {loadingMore ? 'Chargement…' : 'Versets suivants'}
          </button>
        )}
      </div>
    </div>
  );
}
