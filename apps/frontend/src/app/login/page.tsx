'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ApiError } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('admin@qsp.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-dvh flex-col justify-center bg-emerald-800 px-5">
      <div className="mb-6 text-center text-white">
        <p className="text-4xl">☪</p>
        <h1 className="mt-2 text-3xl font-extrabold">Quran</h1>
        <p className="mt-1 text-sm text-emerald-100">Lecture, traduction et tafsir</p>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Connexion</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
