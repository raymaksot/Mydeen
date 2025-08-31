// src/quran/lib/chapters-fallback.ts
export type Surah = { id: number; arabicName: string; englishName: string; ayahCount: number };

export async function fetchChaptersFallback(): Promise<Surah[]> {
  // AlQuran Cloud: https://api.alquran.cloud/v1/surah  (без auth)
  const res = await fetch('https://api.alquran.cloud/v1/surah', { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`fallback chapters ${res.status}`);
  const j = await res.json() as any;
  const data = Array.isArray(j?.data) ? j.data : [];
  return data.map((s: any) => ({
    id: s.number,
    arabicName: s.name,
    englishName: s.englishName,
    ayahCount: s.numberOfAyahs,
  }));
}
