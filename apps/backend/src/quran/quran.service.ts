import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QURAN_TRANSLATION_IDS } from './quran.constants';
import {
  QuranChapter,
  QuranSearchResponse,
  QuranSearchResponseItem,
  QuranTafsirResult,
  QuranVerse,
} from './quran.types';
import { cleanTranslationText, parseVerseKey } from './quran.utils';

interface ApiChapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
  translated_name: { name: string };
}

interface ApiVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani?: string;
  translations?: Array<{ resource_id: number; text: string }>;
}

interface ApiSearchResult {
  verse_key: string;
  verse_id: number;
  text: string;
  translations?: Array<{ resource_id: number; text: string }>;
}

@Injectable()
export class QuranService {
  private readonly logger = new Logger(QuranService.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('QURAN_API_BASE_URL') ??
      'https://api.quran.com/api/v4';
  }

  async getChapters(): Promise<QuranChapter[]> {
    const data = await this.fetch<{ chapters: ApiChapter[] }>(
      '/chapters?language=fr',
    );
    return data.chapters.map((chapter) => ({
      id: chapter.id,
      nameSimple: chapter.name_simple,
      nameArabic: chapter.name_arabic,
      translatedName: chapter.translated_name.name,
      versesCount: chapter.verses_count,
      revelationPlace: chapter.revelation_place,
    }));
  }

  async getVerseByKey(verseKey: string): Promise<QuranVerse> {
    const translationIds = `${QURAN_TRANSLATION_IDS.FRENCH},${QURAN_TRANSLATION_IDS.ENGLISH}`;
    const data = await this.fetch<{ verse: ApiVerse }>(
      `/verses/by_key/${encodeURIComponent(verseKey)}?translations=${translationIds}&fields=text_uthmani`,
    );
    return this.mapVerse(data.verse);
  }

  async getVersesByChapter(
    surah: number,
    page = 1,
    perPage = 20,
  ): Promise<{ verses: QuranVerse[]; totalRecords: number; totalPages: number }> {
    const translationIds = `${QURAN_TRANSLATION_IDS.FRENCH},${QURAN_TRANSLATION_IDS.ENGLISH}`;
    const data = await this.fetch<{
      verses: ApiVerse[];
      pagination: { total_records: number; total_pages: number };
    }>(
      `/verses/by_chapter/${surah}?translations=${translationIds}&fields=text_uthmani&page=${page}&per_page=${perPage}`,
    );

    return {
      verses: data.verses.map((verse) => this.mapVerse(verse)),
      totalRecords: data.pagination.total_records,
      totalPages: data.pagination.total_pages,
    };
  }

  async searchVerses(
    query: string,
    page = 1,
    size = 10,
  ): Promise<QuranSearchResponse> {
    const data = await this.fetch<{
      search: {
        query: string;
        total_results: number;
        current_page: number;
        total_pages: number;
        results: ApiSearchResult[];
      };
    }>(`/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);

    const results: QuranSearchResponseItem[] = data.search.results.map(
      (result) => {
        const { surah, verseNumber } = parseVerseKey(result.verse_key);
        const english = result.translations?.find(
          (t) => t.resource_id === QURAN_TRANSLATION_IDS.ENGLISH,
        );
        return {
          verseKey: result.verse_key,
          surah,
          verseNumber,
          arabicText: result.text,
          englishSnippet: english ? cleanTranslationText(english.text) : null,
        };
      },
    );

    return {
      query: data.search.query,
      totalResults: data.search.total_results,
      currentPage: data.search.current_page,
      totalPages: data.search.total_pages,
      results,
    };
  }

  async getTafsirByAyah(
    resourceId: number,
    verseKey: string,
  ): Promise<QuranTafsirResult | null> {
    try {
      const data = await this.fetch<{
        tafsir: {
          resource_id: number;
          resource_name: string;
          text: string;
        };
      }>(`/tafsirs/${resourceId}/by_ayah/${encodeURIComponent(verseKey)}`);

      if (!data.tafsir?.text?.trim()) return null;

      return {
        source: String(resourceId),
        resourceId: data.tafsir.resource_id,
        resourceName: data.tafsir.resource_name,
        text: data.tafsir.text.trim(),
      };
    } catch {
      return null;
    }
  }

  private mapVerse(verse: ApiVerse): QuranVerse {
    const { surah, verseNumber } = parseVerseKey(verse.verse_key);
    const french = verse.translations?.find(
      (t) => t.resource_id === QURAN_TRANSLATION_IDS.FRENCH,
    );
    const english = verse.translations?.find(
      (t) => t.resource_id === QURAN_TRANSLATION_IDS.ENGLISH,
    );

    return {
      id: verse.id,
      verseKey: verse.verse_key,
      surah,
      verseNumber,
      arabicText: verse.text_uthmani ?? '',
      frenchTranslation: french ? cleanTranslationText(french.text) : '',
      englishTranslation: english ? cleanTranslationText(english.text) : '',
    };
  }

  private async fetch<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.warn(`Quran API ${path} → ${res.status}: ${body.slice(0, 200)}`);
      throw new Error(`Quran API error (${res.status})`);
    }

    return res.json() as Promise<T>;
  }
}
