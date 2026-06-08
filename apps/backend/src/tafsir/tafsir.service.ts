import { Injectable } from '@nestjs/common';
import {
  AUTHORIZED_TAFSIR_SOURCES,
  TAFSIR_SOURCE_CONFIG,
  TafsirSourceKey,
} from '../quran/quran.constants';
import { QuranService } from '../quran/quran.service';

export interface TafsirEntry {
  source: TafsirSourceKey;
  label: string;
  available: boolean;
  content: string | null;
  message?: string;
}

@Injectable()
export class TafsirService {
  constructor(private readonly quranService: QuranService) {}

  getAuthorizedSources(): Array<{ key: TafsirSourceKey; label: string }> {
    return AUTHORIZED_TAFSIR_SOURCES.map((key) => ({
      key,
      label: TAFSIR_SOURCE_CONFIG[key].label,
    }));
  }

  async fetchTafsirsForVerse(verseKey: string): Promise<TafsirEntry[]> {
    const entries = await Promise.all(
      AUTHORIZED_TAFSIR_SOURCES.map((source) =>
        this.fetchSingleTafsir(source, verseKey),
      ),
    );
    return entries;
  }

  private async fetchSingleTafsir(
    source: TafsirSourceKey,
    verseKey: string,
  ): Promise<TafsirEntry> {
    const config = TAFSIR_SOURCE_CONFIG[source];

    if (!config.resourceId) {
      return {
        source,
        label: config.label,
        available: false,
        content: null,
        message:
          "Tafsir Al-Jalalayn non disponible via l'API Quran.com pour le moment.",
      };
    }

    const result = await this.quranService.getTafsirByAyah(
      config.resourceId,
      verseKey,
    );

    if (!result?.text) {
      return {
        source,
        label: config.label,
        available: false,
        content: null,
        message: 'Aucun tafsir trouvé pour ce verset dans cette source.',
      };
    }

    return {
      source,
      label: config.label,
      available: true,
      content: result.text,
    };
  }
}
