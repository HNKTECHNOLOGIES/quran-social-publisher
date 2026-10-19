import Link from 'next/link';

export function ScreenHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 bg-emerald-800 px-4 py-3 text-white">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg"
        >
          ←
        </Link>
      ) : null}
      <h1 className="truncate text-base font-bold">{title}</h1>
    </header>
  );
}
