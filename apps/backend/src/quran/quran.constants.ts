export const QURAN_TRANSLATION_IDS = {
  FRENCH: 136,
  ENGLISH: 20,
} as const;

export const TAFSIR_SOURCE_CONFIG = {
  ibn_kathir: {
    label: 'Ibn Kathir',
    resourceId: 14,
  },
  al_sadi: {
    label: "Al-Sa'di",
    resourceId: 91,
  },
  al_jalalayn: {
    label: 'Al-Jalalayn',
    resourceId: null,
  },
} as const;

export type TafsirSourceKey = keyof typeof TAFSIR_SOURCE_CONFIG;

export const AUTHORIZED_TAFSIR_SOURCES = Object.keys(
  TAFSIR_SOURCE_CONFIG,
) as TafsirSourceKey[];
