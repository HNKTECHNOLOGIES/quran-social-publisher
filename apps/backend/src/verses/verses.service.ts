import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { QuranService } from '../quran/quran.service';
import { TafsirService, TafsirEntry } from '../tafsir/tafsir.service';
import {
  ChapterDto,
  SearchVersesResponseDto,
  SurahVersesResponseDto,
  TafsirDto,
  VerseDto,
  VerseSummaryDto,
} from './dto/verses.dto';

const CACHE_TTL = {
  CHAPTERS: 86_400,
  VERSE: 604_800,
  SEARCH: 3_600,
  SURAH: 86_400,
} as const;

@Injectable()
export class VersesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly quranService: QuranService,
    private readonly tafsirService: TafsirService,
  ) {}

  async getChapters(): Promise<ChapterDto[]> {
    const cacheKey = 'qsp:chapters';
    const cached = await this.redis.getJson<ChapterDto[]>(cacheKey);
    if (cached) return cached;

    const chapters = await this.quranService.getChapters();
    await this.redis.setJson(cacheKey, chapters, CACHE_TTL.CHAPTERS);
    return chapters;
  }

  async searchVerses(
    query: string,
    page = 1,
    size = 10,
  ): Promise<SearchVersesResponseDto> {
    const cacheKey = `qsp:search:${query}:${page}:${size}`;
    const cached = await this.redis.getJson<SearchVersesResponseDto>(cacheKey);
    if (cached) return cached;

    const result = await this.quranService.searchVerses(query, page, size);
    const response: SearchVersesResponseDto = {
      query: result.query,
      totalResults: result.totalResults,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      results: result.results.map((item) => ({
        verseKey: item.verseKey,
        surah: item.surah,
        verseNumber: item.verseNumber,
        arabicText: item.arabicText,
        englishSnippet: item.englishSnippet,
      })),
    };

    await this.redis.setJson(cacheKey, response, CACHE_TTL.SEARCH);
    return response;
  }

  async getVersesBySurah(
    surah: number,
    page = 1,
    perPage = 20,
  ): Promise<SurahVersesResponseDto> {
    const cacheKey = `qsp:surah:${surah}:${page}:${perPage}`;
    const cached = await this.redis.getJson<SurahVersesResponseDto>(cacheKey);
    if (cached) return cached;

    const result = await this.quranService.getVersesByChapter(
      surah,
      page,
      perPage,
    );

    const response: SurahVersesResponseDto = {
      surah,
      page,
      totalRecords: result.totalRecords,
      totalPages: result.totalPages,
      verses: result.verses.map((verse) => ({
        verseKey: verse.verseKey,
        surah: verse.surah,
        verseNumber: verse.verseNumber,
        arabicText: verse.arabicText,
        englishSnippet: verse.englishTranslation || null,
      })),
    };

    await this.redis.setJson(cacheKey, response, CACHE_TTL.SURAH);
    return response;
  }

  async getVerseDetail(surah: number, verseNumber: number): Promise<VerseDto> {
    const verseKey = `${surah}:${verseNumber}`;
    const cacheKey = `qsp:verse:${verseKey}`;
    const cached = await this.redis.getJson<VerseDto>(cacheKey);
    if (cached) return cached;

    const verse = await this.persistVerseWithTafsirs(verseKey);
    await this.redis.setJson(cacheKey, verse, CACHE_TTL.VERSE);
    return verse;
  }

  private async persistVerseWithTafsirs(verseKey: string): Promise<VerseDto> {
    let quranVerse;
    try {
      quranVerse = await this.quranService.getVerseByKey(verseKey);
    } catch {
      throw new ServiceUnavailableException(
        'Impossible de contacter l’API Quran.com',
      );
    }

    if (!quranVerse.arabicText) {
      throw new NotFoundException(`Verset ${verseKey} introuvable`);
    }

    const tafsirEntries =
      await this.tafsirService.fetchTafsirsForVerse(verseKey);

    const dbVerse = await this.prisma.verse.upsert({
      where: { verseKey },
      create: {
        verseKey,
        surah: quranVerse.surah,
        verseNumber: quranVerse.verseNumber,
        arabicText: quranVerse.arabicText,
        frenchTranslation: quranVerse.frenchTranslation,
        englishTranslation: quranVerse.englishTranslation,
      },
      update: {
        arabicText: quranVerse.arabicText,
        frenchTranslation: quranVerse.frenchTranslation,
        englishTranslation: quranVerse.englishTranslation,
      },
    });

    await this.persistTafsirs(dbVerse.id, tafsirEntries);

    const tafsirs = await this.prisma.tafsir.findMany({
      where: { verseId: dbVerse.id },
      orderBy: { source: 'asc' },
    });

    const tafsirMap = new Map(tafsirs.map((t) => [t.source, t.content]));
    const mergedTafsirs = tafsirEntries.map((entry) =>
      this.toTafsirDto(entry, tafsirMap.get(entry.source) ?? entry.content),
    );

    return {
      id: dbVerse.id,
      verseKey: dbVerse.verseKey,
      surah: dbVerse.surah,
      verseNumber: dbVerse.verseNumber,
      arabicText: dbVerse.arabicText,
      frenchTranslation: dbVerse.frenchTranslation,
      englishTranslation: dbVerse.englishTranslation,
      tafsirs: mergedTafsirs,
    };
  }

  private async persistTafsirs(
    verseId: string,
    entries: TafsirEntry[],
  ): Promise<void> {
    for (const entry of entries) {
      if (!entry.available || !entry.content) continue;

      await this.prisma.tafsir.upsert({
        where: {
          verseId_source: {
            verseId,
            source: entry.source,
          },
        },
        create: {
          verseId,
          source: entry.source,
          content: entry.content,
        },
        update: {
          content: entry.content,
        },
      });
    }
  }

  private toTafsirDto(entry: TafsirEntry, content: string | null): TafsirDto {
    return {
      source: entry.source,
      label: entry.label,
      available: entry.available,
      content: entry.available ? content : null,
      message: entry.message,
    };
  }
}
