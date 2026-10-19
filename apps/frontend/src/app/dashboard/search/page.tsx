'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, VerseSummary } from '@/lib/api';

export default function SearchPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VerseSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function search(event: FormEvent | null, nextPage = 1) {
    event?.preventDefault();
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
    <div>
      <header className="sticky top-0 z-10 bg-emerald-800 px-4 py-3 text-white">
        <h1 className="text-base font-bold">Recherche</h1>
      </header>
      <div className="space-y-3 p-4">
        <form onSubmit={(event) => void search(event, 1)} className="space-y-2">
          <input
            aria-label="Recherche de versets"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="mercy, light, guidance…"
            className="w-full rounded-xl border border-slate-300 px-3 py-3 text-base outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Recherche…' : 'Rechercher'}
          </button>
        </form>
        <p className="text-xs leading-5 text-slate-500">
          Index Quran.com : anglais (Saheeh) ou arabe. Exemple : mercy.
        </p>
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {total > 0 && (
          <p className="text-xs text-slate-500">
            {total} résultat{total > 1 ? 's' : ''}
          </p>
        )}
        <ul className="space-y-2">
          {results.map((verse) => (
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
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{verse.englishSnippet}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => void search(null, page - 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-xs text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => void search(null, page + 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
