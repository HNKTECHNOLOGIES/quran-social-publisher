export interface QuranChapter {
  id: number;
  nameSimple: string;
  nameArabic: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: string;
}

export interface QuranVerseTranslation {
  resourceId: number;
  text: string;
}

export interface QuranVerse {
  id: number;
  verseKey: string;
  surah: number;
  verseNumber: number;
  arabicText: string;
  frenchTranslation: string;
  englishTranslation: string;
}

export interface QuranSearchResult {
  verseKey: string;
  verseId: number;
  arabicText: string;
  englishSnippet: string | null;
}

export interface QuranSearchResponse {
  query: string;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  results: QuranSearchResponseItem[];
}

export interface QuranSearchResponseItem {
  verseKey: string;
  surah: number;
  verseNumber: number;
  arabicText: string;
  englishSnippet: string | null;
}

export interface QuranTafsirResult {
  source: string;
  resourceId: number;
  resourceName: string;
  text: string;
}
