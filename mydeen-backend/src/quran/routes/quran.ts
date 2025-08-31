import { Router } from 'express';
import { swr } from '../lib/cache';
import { qfChapters, qfVersesByChapter, qfTafsir, qfAudioByVerse, qfRecitations, getDefaultTranslationId, getDefaultTafsirId  } from '../lib/qf';
import { mapSurahsQF, mapAyahsQF, mapTafsirQF, mapAudioQF } from '../lib/normalize';
import { fetchChaptersFallback } from '../lib/chapters-fallback';

const router = Router();

// Список сур
router.get('/surahs', async (req, res, next) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const data = await swr(`qf:chapters:${lang}`, async () => {
      const raw = await qfChapters({ language: lang, page: 1, per_page: 200 });
      const list = mapSurahsQF(raw);
      if (list.length >= 100) return list;           // нормальные 114
      // фолбэк (prelive QF отдаёт только 2)
      const fb = await fetchChaptersFallback();
      return fb;
    }, 86400);
    res.json(data);
  } catch (e) { next(e); }
});
// Аяты суры
router.get('/surahs/:id/ayahs', async (req, res, next) => {
  try {
    const surahId = Number(req.params.id);
    const lang = (req.query.lang as string) || 'en';
    const trId = await getDefaultTranslationId(lang);

    const key = `qf:verses:${surahId}:${lang}:tr${trId}`;
    const tafsirId = await getDefaultTafsirId(lang);
    const data = await swr(key, async () => {
      const raw = await qfVersesByChapter(surahId, {
        language: lang,
        words: false,
        per_page: 300,
        fields: 'text_uthmani',
        translation_ids: String(trId),
        tafsirs: String(tafsirId),            
      });
      return mapAyahsQF(surahId, raw, lang); // внутри маппера возьмите v.text_uthmani и v.translations[0]?.text
    }, 86400);
    res.json(data);
  } catch (e) { next(e); }
});

// Тафсир
router.get('/tafseer', async (req, res, next) => {
  try {
    const ayahId = String(req.query.ayahId); // "1:1"
    const lang = (req.query.lang as string) || 'en';
    const tafsirId = req.query.tafsir_id
      ? Number(req.query.tafsir_id)
      : await getDefaultTafsirId(lang);

    const key = `qf:tafsir:${ayahId}:${tafsirId}`;
    const data = await swr(key, async () => {
      const raw = await qfTafsir(ayahId, tafsirId);   // ✅
      return mapTafsirQF(ayahId, lang, raw);
    }, 86400 * 7);
    res.json(data);
  } catch (e) { next(e); }
});


// Аудио по аяту (нужен recitationId)
router.get('/ayahs/:id/audio', async (req, res, next) => {
  try {
    const ayahKey = String(req.params.id); // ожидаем "1:1"
    let recitationId = Number(req.query.reciterId);
    if (!req.query.reciterId || isNaN(recitationId)) recitationId = 7; // по умолчанию Mishary Alafasy
    const key = `qf:audio:${ayahKey}:${recitationId}`;
    const data = await swr(key, async () => {
      const raw = await qfAudioByVerse(ayahKey, recitationId);
      return mapAudioQF(raw);
    }, 86400);
    res.json(data);
  } catch (e) { next(e); }
});

// (опционально) список рецитаторов
router.get('/recitations', async (_req, res, next) => {
  try {
    const data = await swr('qf:recitations', () => qfRecitations(), 86400 * 7);
    res.json(data);
  } catch (e) { next(e); }
});

export default router;
