// src/quran/lib/qf.ts
const OAUTH = process.env.QF_ENV === 'prod'
  ? 'https://oauth2.quran.foundation/oauth2/token'
  : 'https://prelive-oauth2.quran.foundation/oauth2/token';

const BASE = process.env.QF_ENV === 'prod'
  ? 'https://apis.quran.foundation/content/api/v4'
  : 'https://apis-prelive.quran.foundation/content/api/v4';

const CLIENT_ID = process.env.QF_CLIENT_ID!;
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET!;

import { redis } from '../lib/cache';

async function oauthToken(): Promise<string> {
  const cacheKey = `qf:token:${process.env.QF_ENV}`;
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const body = new URLSearchParams();
  body.set('grant_type', 'client_credentials');
  body.set('scope', 'content');

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  // 1) Основной путь — Basic
  let res = await fetch(OAUTH, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  // 2) Если 401 — пробуем client_id/client_secret в теле (некоторые провайдеры это требуют)
  if (res.status === 401) {
    const body2 = new URLSearchParams();
    body2.set('grant_type', 'client_credentials');
    body2.set('scope', 'content');
    body2.set('client_id', CLIENT_ID);
    body2.set('client_secret', CLIENT_SECRET);

    res = await fetch(OAUTH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body2.toString(),
    });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[QF OAuth Error]', res.status, res.statusText, text);
    throw new Error(`OAuth ${res.status} ${res.statusText}`);
  }

  const j = await res.json() as { access_token: string; expires_in: number; };
  await redis.set(cacheKey, j.access_token, 'EX', Math.max(60, (j.expires_in || 3600) - 60));
  return j.access_token;
}

async function apiGet(path: string) {
  const doReq = async () => {
    const token = await oauthToken();
    return fetch(`${BASE}${path}`, {
      headers: { 'x-auth-token': token, 'x-client-id': CLIENT_ID, 'Accept': 'application/json' },
    });
  };

  let res = await doReq();
  if (res.status === 401 || res.status === 403) {
    await redis.del(`qf:token:${process.env.QF_ENV}`); // сброс кэша
    res = await doReq(); // повторно с новым токеном
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[QF API Error]', res.status, res.statusText, path, text);
    throw new Error(`QF ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// src/quran/lib/qf.ts
export async function qfChapters(params?: { language?: string; page?: number; per_page?: number }) {
  const qs = new URLSearchParams();
  qs.set('page', String(params?.page ?? 1));
  qs.set('per_page', String(params?.per_page ?? 200)); // <<< ключевое
  if (params?.language) qs.set('language', params.language);

  // ВРЕМЕННО: логни полный URL
  const url = `/chapters?${qs.toString()}`;
  console.log('QF GET', url);          // должно быть /chapters?page=1&per_page=200&language=en
  return apiGet(url);
}

export async function qfTafsir(ayahKey: string, tafsirId: number) {
  // корректный эндпоинт
  return apiGet(`/tafsirs/${tafsirId}/by_ayah/${encodeURIComponent(ayahKey)}`);
}

export async function qfRecitations() { return apiGet('/resources/recitations'); }
export async function qfAudioByVerse(verseKey: string, recitationId: number) {
  return apiGet(`/recitations/${recitationId}/by_ayah/${encodeURIComponent(verseKey)}`);
}
export async function qfTranslations() {
  return apiGet('/resources/translations'); // список переводов
}

export async function qfTafsirResources() {
  return apiGet('/resources/tafsirs'); // { tafsirs: [...] }
}

function pickByLangAndName(items: any[], lang: string, needles: string[]) {
  const L = (s: string) => s?.toLowerCase() ?? '';
  const langItems = items.filter(x => L(x.language_name) === L(lang));
  // сначала точечный матч по имени/слагу
  for (const n of needles.map(L)) {
    const hit = langItems.find(x => L(x.name).includes(n) || L(x.slug).includes(n) || L(x.author_name).includes(n));
    if (hit) return hit.id;
  }
  // иначе — первый по языку
  return langItems[0]?.id;
}
export async function getDefaultTranslationId(lang: string) {
  const key = `qf:trid:${lang}`;
  const cached = await redis.get(key);
  if (cached) return Number(cached);

  const data = await qfTranslations();
  // дефолтные «иголки»
  const needles = (lang === 'en')
    ? ['saheeh international', 'saheeh']
    : (lang === 'ru')
      ? ['kuliev', 'кулиев']
      : [];
  const id = pickByLangAndName(data.translations || [], lang, needles) ?? 20; // запасной EN=Saheeh (20)
  await redis.set(key, String(id), 'EX', 86400 * 7);
  return id;
}

export async function getDefaultTafsirId(lang: string) {
  const key = `qf:taf-id:${lang}`;
  const cached = await redis.get(key);
  if (cached) return Number(cached);

  const data = await qfTafsirResources();
  // дефолт EN → Ibn Kathir; RU → первый русскоязычный
  const needles = (lang === 'en') ? ['ibn kathir'] : [];
  const id = pickByLangAndName(data.tafsirs || [], lang, needles) ?? 169; // EN Ibn Kathir (169)
  await redis.set(key, String(id), 'EX', 86400 * 7);
  return id;
}
export async function qfVersesByChapter(
  chapterId: number,
  params: { language?: string; page?: number; per_page?: number; words?: boolean;
            translation_ids?: string; fields?: string; tafsirs?: string }
) {
  const qs = new URLSearchParams();
  if (params.language) qs.set('language', params.language);
  if (params.page) qs.set('page', String(params.page));
  if (params.per_page) qs.set('per_page', String(params.per_page));
  if (params.words !== undefined) qs.set('words', String(params.words));
  if (params.translation_ids) qs.set('translation_ids', params.translation_ids);
  if (params.fields) qs.set('fields', params.fields);
  if (params.tafsirs) qs.set('tafsirs', params.tafsirs);
  return apiGet(`/verses/by_chapter/${chapterId}?${qs.toString()}`);
}