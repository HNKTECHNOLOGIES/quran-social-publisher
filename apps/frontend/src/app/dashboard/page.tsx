'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, DashboardStats } from '@/lib/api';

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
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
    ? new Date(stats.lastPublishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="mt-1 text-slate-600">
          Vue d&apos;ensemble de vos publications islamiques
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total publications"
          value={stats?.totalPosts ?? '—'}
          icon="📝"
        />
        <StatCard
          label="Programmées"
          value={stats?.scheduledPosts ?? '—'}
          icon="⏰"
        />
        <StatCard
          label="Publiées"
          value={stats?.publishedPosts ?? '—'}
          icon="✅"
        />
        <StatCard label="Dernière publication" value={lastPub} icon="📅" />
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-lg font-semibold text-slate-700">Phase 1 — MVP</p>
        <p className="mt-2 text-sm text-slate-500">
          Prochaines étapes : recherche de versets, tafsir, génération GPT
          trilingue et publication Facebook.
        </p>
      </div>
    </div>
  );
}
