export type Surah = { id: number; arabicName: string; englishName: string; ayahCount: number; };
export type Ayah = {
  id: string;              // глобальный ayahId
  surahId: number;
  numberInSurah: number;
  arabic: string;
  translation: string;
  duration?: number;
};
export type Tafsir = { ayahId: string; text: string; source: string; lang: string };
export type Progress = { surahId: number; ayahNumber: number; autoPlay?: boolean };
