export function parseVerseKey(verseKey: string): {
  surah: number;
  verseNumber: number;
} {
  const [surahPart, versePart] = verseKey.split(':');
  const surah = Number(surahPart);
  const verseNumber = Number(versePart);
  if (
    !Number.isInteger(surah) ||
    !Number.isInteger(verseNumber) ||
    surah < 1 ||
    surah > 114 ||
    verseNumber < 1
  ) {
    throw new Error(`Clé de verset invalide: ${verseKey}`);
  }
  return { surah, verseNumber };
}

export function cleanTranslationText(text: string): string {
  return text.replace(/<sup[^>]*>.*?<\/sup>/gi, '').trim();
}
