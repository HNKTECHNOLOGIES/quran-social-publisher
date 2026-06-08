export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  lastPublishedAt: string | null;
}

export interface Chapter {
  id: number;
  nameSimple: string;
  nameArabic: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: string;
}

export interface VerseSummary {
  verseKey: string;
  surah: number;
  verseNumber: number;
  arabicText: string;
  englishSnippet: string | null;
}

export interface SearchVersesResponse {
  query: string;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  results: VerseSummary[];
}

export interface SurahVersesResponse {
  surah: number;
  page: number;
  totalRecords: number;
  totalPages: number;
  verses: VerseSummary[];
}

export interface Tafsir {
  source: string;
  label: string;
  available: boolean;
  content: string | null;
  message?: string;
}

export interface VerseDetail {
  id: string;
  verseKey: string;
  surah: number;
  verseNumber: number;
  arabicText: string;
  frenchTranslation: string;
  englishTranslation: string;
  tafsirs: Tafsir[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message ?? 'Erreur API', res.status);
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: (token: string) =>
    request<User>('/users/me', {}, token),

  getDashboardStats: (token: string) =>
    request<DashboardStats>('/dashboard/stats', {}, token),

  getChapters: (token: string) =>
    request<Chapter[]>('/verses/chapters', {}, token),

  searchVerses: (
    token: string,
    q: string,
    page = 1,
    size = 10,
  ) =>
    request<SearchVersesResponse>(
      `/verses/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`,
      {},
      token,
    ),

  getVersesBySurah: (
    token: string,
    surah: number,
    page = 1,
    perPage = 20,
  ) =>
    request<SurahVersesResponse>(
      `/verses/surah/${surah}?page=${page}&perPage=${perPage}`,
      {},
      token,
    ),

  getVerseDetail: (token: string, surah: number, verse: number) =>
    request<VerseDetail>(`/verses/${surah}/${verse}`, {}, token),
};
