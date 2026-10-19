'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, Chapter } from '@/lib/api';

function placeLabel(place: string) {
  const value = place.toLowerCase();
  if (value.includes('makk') || value.includes('mecq')) return 'La Mecque';
  if (value.includes('madin') || value.includes('medin')) return 'Médine';
  return place;
}

export default function SurahsPage() {
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

  return (
    <div>
      <header className="sticky top-0 z-10 bg-emerald-800 px-4 py-3 text-white">
        <h1 className="text-base font-bold">Sourates</h1>
      </header>

      {error && (
        <p className="m-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {loading && <p className="p-4 text-sm text-slate-500">Chargement des sourates…</p>}

      <ul className="space-y-2 p-3">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <Link
              href={`/dashboard/verses/${chapter.id}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-extrabold text-emerald-800">
                {chapter.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">
                  {chapter.translatedName}
                </span>
                <span className="block text-xs text-slate-500">
                  {chapter.versesCount} versets · {placeLabel(chapter.revelationPlace)}
                </span>
              </span>
              <span className="font-arabic text-xl text-emerald-800">{chapter.nameArabic}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
