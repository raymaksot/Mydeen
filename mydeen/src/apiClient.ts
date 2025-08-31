import type { Surah, Ayah, Tafsir, Progress } from '../app/types/+api';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const BASE_URL = 'http://192.168.18.5:4000';
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Accept': 'application/json', ...(init?.headers || {}) },
        ...init,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json() as Promise<T>;
}

export const api = {
    getSurahs: (lang='en') => http<Surah[]>(`/surahs?lang=${lang}`),
    getAyahs: (surahId: number, offset=0, limit=300, lang='en') =>
        http<Ayah[]>(`/surahs/${surahId}/ayahs?lang=${lang}&offset=${offset}&limit=${limit}`),
    getAudioUrl: (ayahId: string, reciterId: string, preferMp3=false) =>
        http<{ url: string; isHls: boolean }>(`/ayahs/${ayahId}/audio?reciterId=${reciterId}${preferMp3 ? '&prefer=mp3' : ''}`),
    getTafsir: (ayahId: string, lang='en') => http<Tafsir>(`/tafseer?ayahId=${ayahId}&lang=${lang}`),
    getProgress: () => http<Progress>(`/progress`),
    setProgress: (p: Progress) => http<Progress>(`/progress`, { method: 'PUT', body: JSON.stringify(p), headers: { 'Content-Type': 'application/json' } }),
    // закладки/профиль можно добавить по мере интеграции
};
