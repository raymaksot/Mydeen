import * as FileSystem from 'expo-file-system';
import { api } from '../api/client';
import type { Ayah } from '../types/+api';

const ROOT = FileSystem.documentDirectory + 'offline/';

async function ensureDirs(surahId: number) {
  await FileSystem.makeDirectoryAsync(`${ROOT}${surahId}/audio/`, { intermediates: true }).catch(()=>{});
  await FileSystem.makeDirectoryAsync(`${ROOT}${surahId}/tr/`, { intermediates: true }).catch(()=>{});
}

export async function findLocalAudio(surahId: number, ayahNumber: number): Promise<string | undefined> {
  const mp3 = `${ROOT}${surahId}/audio/${ayahNumber}.mp3`;
  const i1 = await FileSystem.getInfoAsync(mp3);
  if (i1.exists) return mp3;
  return undefined; // m3u8 оффлайн не поддерживаем без сегментов
}

export async function downloadSurahDirect(surahId: number, ayahs: Ayah[], reciterId='default', lang='en') {
  await ensureDirs(surahId);

  // аудио: стараемся получить MP3 (BFF может отдать mp3 при prefer=mp3)
  for (const a of ayahs) {
    const local = await findLocalAudio(surahId, a.numberInSurah);
    if (local) continue;
    try {
      const { url } = await api.getAudioUrl(a.id, reciterId, true);
      const target = `${ROOT}${surahId}/audio/${a.numberInSurah}.mp3`;
      await FileSystem.downloadAsync(url, target);
    } catch {}
  }

  // переводы — одним JSON
  const trPath = `${ROOT}${surahId}/tr/${lang}.json`;
  await FileSystem.writeAsStringAsync(trPath, JSON.stringify(ayahs.map(x => ({ n: x.numberInSurah, t: x.translation }))));

  await FileSystem.writeAsStringAsync(`${ROOT}${surahId}/meta.json`, JSON.stringify({ surahId, lang, at: Date.now() }));
  return true;
}
