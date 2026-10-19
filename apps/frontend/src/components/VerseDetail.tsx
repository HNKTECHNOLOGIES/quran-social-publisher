import { VerseDetail as VerseDetailData } from '@/lib/api';

export function VerseDetailView({ verse }: { verse: VerseDetailData }) {
  return (
    <div className="space-y-4 p-4">
      <p className="font-arabic text-right text-3xl leading-[1.9] text-slate-900">
        {verse.arabicText}
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Français
        </h2>
        <p className="mt-2 text-base leading-7 text-slate-800">
          {verse.frenchTranslation}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          English
        </h2>
        <p className="mt-2 text-base leading-7 text-slate-800">
          {verse.englishTranslation}
        </p>
      </section>

      <h2 className="text-lg font-bold text-slate-900">Tafsirs</h2>
      {verse.tafsirs.map((tafsir) => (
        <section
          key={tafsir.source}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-emerald-800">{tafsir.label}</h3>
            {!tafsir.available && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                indisponible
              </span>
            )}
          </div>
          {tafsir.available && tafsir.content ? (
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dir="auto"
              dangerouslySetInnerHTML={{ __html: tafsir.content }}
            />
          ) : (
            <p className="text-sm text-slate-500">
              {tafsir.message ?? 'Tafsir non disponible pour ce verset.'}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
