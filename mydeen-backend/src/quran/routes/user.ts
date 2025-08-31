import { Router } from 'express';
import { z } from 'zod';
import { repoGetPrefs, repoGetProgress, repoSetPrefs, repoSetProgress } from '../lib/mongo.js';

const router = Router();

// progress
router.get('/progress', async (req, res) => {
  const uid = (req as any).userId as string;
  const p = await repoGetProgress(uid);
  res.json(p ?? { surahId: 1, ayahNumber: 1 });
});

router.put('/progress', async (req, res) => {
  const uid = (req as any).userId as string;
  const body = z.object({ surahId: z.number(), ayahNumber: z.number() }).parse(req.body);
  await repoSetProgress(uid, body.surahId, body.ayahNumber);
  res.json(body);
});

router.get('/user/prefs', async (req, res) => {
  const uid = (req as any).userId as string;
  res.json(await repoGetPrefs(uid));
});

router.put('/user/prefs', async (req, res) => {
  const uid = (req as any).userId as string;
  const body = z.object({
    reciterId: z.string().optional(),
    speed: z.number().min(0.5).max(2).optional(),
    translationLang: z.string().optional(),
    autoplayNext: z.boolean().optional(),
  }).parse(req.body);
  await repoSetPrefs(uid, body);
  res.json(await repoGetPrefs(uid));
});

export default router;
