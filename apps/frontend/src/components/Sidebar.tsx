'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/dashboard/verses', label: 'Versets', icon: '📖' },
  { href: '/dashboard/posts', label: 'Publications', icon: '📝', soon: true },
  { href: '/dashboard/facebook', label: 'Facebook', icon: '📘', soon: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="font-bold text-emerald-800">Quran Social Publisher</p>
        <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.soon ? '#' : item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-emerald-50 text-emerald-800'
                  : item.soon
                    ? 'cursor-not-allowed text-slate-400'
                    : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.soon && (
                <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                  bientôt
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={logout}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
