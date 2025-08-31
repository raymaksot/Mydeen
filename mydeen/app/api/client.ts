// src/api/client.ts
import type { Surah, Ayah, Tafsir, Progress } from '../types/+api';

const BASE_URL = 'http://192.168.18.5:4000'; // эмулятор Android: http://10.0.2.2:4000
const P = '/api/quran'; // <— префикс роутера

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(()=>'');
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getSurahs: (lang='en') => http<Surah[]>(`${P}/surahs?lang=${lang}`),

  getAyahs: (surahId: number, _offset=0, _limit=300, lang='en') =>
    http<Ayah[]>(`${P}/surahs/${surahId}/ayahs?lang=${lang}`),

  getAudioUrl: (ayahId: string, reciterId: number | string, preferMp3=false) =>
    http<{ url: string; isHls: boolean }>(
      `${P}/ayahs/${encodeURIComponent(ayahId)}/audio?reciterId=${reciterId}${preferMp3 ? '&prefer=mp3' : ''}`
    ),

  getTafsir: (ayahId: string, lang='en') =>
    http<Tafsir>(`${P}/tafseer?ayahId=${encodeURIComponent(ayahId)}&lang=${lang}`),

  getProgress: () => http<Progress>(`${P}/progress`),

  setProgress: (p: Progress) =>
    http<Progress>(`${P}/progress`, {
      method: 'PUT',
      body: JSON.stringify(p),
      headers: { 'Content-Type': 'application/json' },
    }),
};
