'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  api,
  Chapter,
  VerseDetail,
  VerseSummary,
} from '@/lib/api';

type SearchMode = 'keyword' | 'surah' | 'verse';

function TafsirBlock({ tafsir }: { tafsir: VerseDetail['tafsirs'][number] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-emerald-800">{tafsir.label}</h4>
        {!tafsir.available && (
          <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
            indisponible
          </span>
        )}
      </div>
      {tafsir.available && tafsir.content ? (
        <div
          className="prose prose-sm max-w-none text-slate-700 prose-p:my-2"
          dir="auto"
          dangerouslySetInnerHTML={{ __html: tafsir.content }}
        />
      ) : (
        <p className="text-sm text-slate-500">
          {tafsir.message ?? 'Tafsir non disponible pour ce verset.'}
        </p>
      )}
    </div>
  );
}

function VerseResultItem({
  item,
  chapterName,
  selected,
  onSelect,
}: {
  item: VerseSummary;
  chapterName?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-4 text-left transition ${
        selected
          ? 'border-emerald-300 bg-emerald-50'
          : 'border-slate-200 bg-white hover:border-emerald-200'
      }`}
    >
      <p className="text-xs font-medium text-emerald-700">
        {chapterName ?? `Sourate ${item.surah}`} — {item.verseKey}
      </p>
      <p className="mt-2 font-arabic text-right text-lg leading-loose text-slate-900" dir="rtl">
        {item.arabicText}
      </p>
      {item.englishSnippet && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {item.englishSnippet}
        </p>
      )}
    </button>
  );
}

export default function VersesPage() {
  const { token } = useAuth();
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [verseNumber, setVerseNumber] = useState(1);
  const [results, setResults] = useState<VerseSummary[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<VerseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [surahPage, setSurahPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    api
      .getChapters(token)
      .then(setChapters)
      .catch(() => setError('Impossible de charger les sourates'));
  }, [token]);

  const chapterMap = new Map(chapters.map((c) => [c.id, c]));

  const loadVerseDetail = useCallback(
    async (surah: number, verse: number, verseKey: string) => {
      if (!token) return;
      setSelectedKey(verseKey);
      setLoadingDetail(true);
      setError('');
      try {
        const data = await api.getVerseDetail(token, surah, verse);
        setDetail(data);
      } catch {
        setError('Impossible de charger le détail du verset');
        setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    },
    [token],
  );

  const handleKeywordSearch = async (page = 1) => {
    if (!token || !keyword.trim()) return;
    setLoading(true);
    setError('');
    setDetail(null);
    setSelectedKey(null);
    try {
      const data = await api.searchVerses(token, keyword.trim(), page);
      setResults(data.results);
      setSearchPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch {
      setError('Recherche impossible');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSurahBrowse = async (page = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    setDetail(null);
    setSelectedKey(null);
    try {
      const data = await api.getVersesBySurah(token, selectedSurah, page);
      setResults(data.verses);
      setSurahPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      setError('Impossible de charger les versets de cette sourate');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectVerse = async () => {
    if (!token) return;
    const chapter = chapterMap.get(selectedSurah);
    if (chapter && verseNumber > chapter.versesCount) {
      setError(
        `Cette sourate ne contient que ${chapter.versesCount} versets`,
      );
      return;
    }
    setResults([]);
    await loadVerseDetail(selectedSurah, verseNumber, `${selectedSurah}:${verseNumber}`);
  };

  const selectedChapter = chapterMap.get(
    detail?.surah ?? selectedSurah,
  );

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="w-full shrink-0 border-b border-slate-200 bg-white p-6 lg:w-[420px] lg:border-b-0 lg:border-r">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Versets</h1>
          <p className="mt-1 text-sm text-slate-600">
            Recherche via Quran.com — texte authentique, tafsirs autorisés
          </p>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
          {(
            [
              ['keyword', 'Mot-clé'],
              ['surah', 'Sourate'],
              ['verse', 'N° verset'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                mode === value
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'keyword' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleKeywordSearch(1);
            }}
            className="space-y-3"
          >
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ex. miséricorde, guidance..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? 'Recherche…' : 'Rechercher'}
            </button>
          </form>
        )}

        {mode === 'surah' && (
          <div className="space-y-3">
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.id}. {chapter.translatedName} ({chapter.nameArabic})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleSurahBrowse(1)}
              disabled={loading}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? 'Chargement…' : 'Afficher les versets'}
            </button>
          </div>
        )}

        {mode === 'verse' && (
          <div className="space-y-3">
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.id}. {chapter.translatedName}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={verseNumber}
              onChange={(e) => setVerseNumber(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Numéro du verset"
            />
            <button
              type="button"
              onClick={handleDirectVerse}
              disabled={loadingDetail}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loadingDetail ? 'Chargement…' : 'Afficher le verset'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Résultats
            </p>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              {results.map((item) => (
                <VerseResultItem
                  key={item.verseKey}
                  item={item}
                  chapterName={chapterMap.get(item.surah)?.translatedName}
                  selected={selectedKey === item.verseKey}
                  onSelect={() =>
                    loadVerseDetail(item.surah, item.verseNumber, item.verseKey)
                  }
                />
              ))}
            </div>

            {(mode === 'keyword' || mode === 'surah') && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={
                    loading ||
                    (mode === 'keyword' ? searchPage <= 1 : surahPage <= 1)
                  }
                  onClick={() =>
                    mode === 'keyword'
                      ? handleKeywordSearch(searchPage - 1)
                      : handleSurahBrowse(surahPage - 1)
                  }
                  className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
                >
                  Précédent
                </button>
                <span className="text-xs text-slate-500">
                  Page {mode === 'keyword' ? searchPage : surahPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={
                    loading ||
                    (mode === 'keyword'
                      ? searchPage >= totalPages
                      : surahPage >= totalPages)
                  }
                  onClick={() =>
                    mode === 'keyword'
                      ? handleKeywordSearch(searchPage + 1)
                      : handleSurahBrowse(surahPage + 1)
                  }
                  className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!detail && !loadingDetail && (
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-700">
                Sélectionnez un verset
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Le texte arabe, les traductions FR/EN et les tafsirs autorisés
                s&apos;afficheront ici.
              </p>
            </div>
          </div>
        )}

        {loadingDetail && (
          <div className="flex min-h-[320px] items-center justify-center text-slate-500">
            Chargement du verset…
          </div>
        )}

        {detail && !loadingDetail && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                {selectedChapter?.translatedName ?? `Sourate ${detail.surah}`}{' '}
                — {detail.verseKey}
              </p>
              <p
                className="mt-4 text-3xl leading-loose text-slate-900"
                dir="rtl"
              >
                {detail.arabicText}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Traduction FR
                </h3>
                <p className="text-slate-800">{detail.frenchTranslation}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Traduction EN
                </h3>
                <p className="text-slate-800">{detail.englishTranslation}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                Tafsirs autorisés
              </h3>
              <div className="space-y-4">
                {detail.tafsirs.map((tafsir) => (
                  <TafsirBlock key={tafsir.source} tafsir={tafsir} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
