// src/lib/normalize.ts
export type Surah = { id: number; arabicName: string; englishName: string; ayahCount: number };
export type Ayah = { id: string; surahId: number; numberInSurah: number; arabic: string; translation: string; duration?: number };
export type Tafsir = { ayahId: string; source: string; text: string; lang: string };

export const mapSurahsQF = (raw: any): Surah[] => {
  const list = raw.chapters ?? [];
  return list.map((c: any) => ({
    id: c.id,
    arabicName: c.name_arabic,
    englishName: c.translated_name?.name ?? c.name_simple,
    ayahCount: c.verses_count,
  }));
};

export const mapAyahsQF = (surahId: number, raw: any, lang = 'en'): Ayah[] => {
  const verses = raw.verses ?? [];
  return verses.map((v: any) => {
    const verseKey: string = v.verse_key; // "1:1"
    const numberInSurah = Number(verseKey.split(':')[1]);
    const translation = (v.translations && v.translations[0]?.text) || '';
    return {
      id: verseKey, // используем verse_key как стабильный айди
      surahId,
      numberInSurah,
      arabic: v.text_uthmani ?? v.text_imlaei ?? v.text_indopak ?? v.text_madani ?? '',
      translation,
      duration: undefined,
    };
  });
};

export const mapTafsirQF = (ayahKey: string, lang = 'en', raw: any): Tafsir => {
  const t =
    raw?.tafsir ??
    (Array.isArray(raw?.tafsirs) ? raw.tafsirs[0] : undefined) ??
    {};
  return {
    ayahId: ayahKey,
    source: t.resource_name ?? t.resource?.name ?? 'tafsir',
    text: t.text ?? '',
    lang,
  };
};

export const mapAudioQF = (raw: any): { url: string; isHls: boolean } => {
  const f = raw.audio_files?.[0];
  return { url: f?.audio_url ?? '', isHls: false }; // QF отдает mp3 URL
};
