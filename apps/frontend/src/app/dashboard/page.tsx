'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, DashboardStats } from '@/lib/api';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .getDashboardStats(token)
      .then(setStats)
      .catch(() => setError('Impossible de charger les statistiques'));
  }, [token]);

  const lastPub = stats?.lastPublishedAt
    ? new Date(stats.lastPublishedAt).toLocaleDateString('fr-FR')
    : '—';

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">As-salamu alaykum</h1>
        <p className="truncate text-sm text-slate-500">{user?.email}</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Publications" value={String(stats?.totalPosts ?? '—')} />
        <Stat label="Programmées" value={String(stats?.scheduledPosts ?? '—')} />
        <Stat label="Publiées" value={String(stats?.publishedPosts ?? '—')} />
        <Stat label="Dernière" value={lastPub} />
      </div>

      <Link
        href="/dashboard/verses/1"
        className="block rounded-3xl bg-emerald-800 p-5 text-white"
      >
        <p className="text-sm font-semibold text-emerald-100">Commencer la lecture</p>
        <p className="font-arabic mt-2 text-right text-4xl">الفاتحة</p>
        <p className="mt-1 text-xl font-extrabold">Al-Fatiha</p>
        <p className="mt-1 text-sm text-emerald-100">
          Texte, traductions FR/EN et tafsirs
        </p>
      </Link>

      <div className="flex gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">Publications · bientôt</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Facebook · bientôt</span>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700"
      >
        Déconnexion
      </button>
    </div>
  );
}
