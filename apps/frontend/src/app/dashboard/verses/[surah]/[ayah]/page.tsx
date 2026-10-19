'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, VerseDetail } from '@/lib/api';
import { ScreenHeader } from '@/components/ScreenHeader';
import { VerseDetailView } from '@/components/VerseDetail';

export default function AyahPage() {
  const params = useParams<{ surah: string; ayah: string }>();
  const surah = Number(params.surah);
  const ayah = Number(params.ayah);
  const { token } = useAuth();
  const [verse, setVerse] = useState<VerseDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !Number.isFinite(surah) || !Number.isFinite(ayah)) return;
    setLoading(true);
    api
      .getVerseDetail(token, surah, ayah)
      .then(setVerse)
      .catch(() => setError('Impossible de charger ce verset'))
      .finally(() => setLoading(false));
  }, [ayah, surah, token]);

  return (
    <div>
      <ScreenHeader
        title={verse?.verseKey ?? `${surah}:${ayah}`}
        backHref={`/dashboard/verses/${surah}`}
      />
      {loading && <p className="p-4 text-sm text-slate-500">Chargement du verset…</p>}
      {error && (
        <p className="m-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {verse && <VerseDetailView verse={verse} />}
    </div>
  );
}
