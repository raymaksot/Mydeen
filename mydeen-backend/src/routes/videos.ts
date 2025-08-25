import { Router } from "express";
import Video from "../models/Video";
import Viewing from "../models/Viewing";
import { fetchOEmbed, parseYouTubeId, secsToMMSS, ytThumb } from "../utils/youtube";

const router = Router();

/* -------- helpers -------- */
function toDTO(v: any) {
  return {
    id: String(v._id),
  youtubeId: v.youtubeId, // добавлено для мобильного клиента (встраивание плеера)
    title: v.title,
    author: v.channel,
    duration: secsToMMSS(v.durationSec) ?? "–:–",
  durationSec: v.durationSec ?? null, // сырой формат (секунды)
    thumb: ytThumb(v.youtubeId, "hqdefault"),
    category: v.category,
    url: v.url,
    viewCount: v.viewCount,
  tags: v.tags ?? [],
  };
}

/* -------- POST /api/videos  (добавление ролика YouTube) --------
   body: { url, category, tags?, durationSec? }
   попытаемся подтянуть title/channel через oEmbed, если не передали.
*/
router.post("/", async (req, res) => {
  const { url, category, tags = [], durationSec = null } = req.body ?? {};
  if (!url || !category) return res.status(400).json({ error: "url & category required" });

  const id = parseYouTubeId(url);
  if (!id) return res.status(400).json({ error: "Invalid YouTube url" });

  let title = req.body.title as string | undefined;
  let channel = req.body.channel as string | undefined;
  if (!title || !channel) {
    const meta = await fetchOEmbed(url);
    if (meta) { title = title ?? meta.title; channel = channel ?? meta.channel; }
  }

  const doc = await Video.create({
    youtubeId: id, url, title: title ?? "Untitled",
    channel: channel ?? "", durationSec, category, tags,
  });
  res.status(201).json({ item: toDTO(doc) });
});

/* -------- GET /api/videos  (список + поиск) --------
   query: category?, q?, tags? (comma), sort?=recent|popular, cursor?, limit?
   пагинация по publishedAt (или _id).
*/
router.get("/", async (req, res) => {
  const { category, q, tags, sort = "recent", cursor, limit = "10" } = req.query as any;
  const L = Math.min(Math.max(parseInt(limit || "10"), 1), 50);

  const filter: any = {};
  if (category) filter.category = category;
  if (tags) filter.tags = { $in: String(tags).split(",").map((t) => t.trim()).filter(Boolean) };

  // поиск: текстовый + фоллбэк на регексы
  if (q) {
    filter.$or = [
      { $text: { $search: q } },
      { title: { $regex: q, $options: "i" } },
      { channel: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }

  // пагинация курсором по времени публикации
  if (cursor) filter.publishedAt = { $lt: new Date(String(cursor)) };

  const sortSpec: { [key: string]: 1 | -1 } = sort === "popular"
    ? { viewCount: -1, publishedAt: -1 }
    : { publishedAt: -1, _id: -1 };
  const rows = await Video.find(filter).sort(sortSpec).limit(L + 1).lean();

  const items = rows.slice(0, L).map(toDTO);
  const nextCursor = rows.length > L ? rows[L - 1].publishedAt : undefined;
  res.json({ items, nextCursor });
});

/* -------- GET /api/videos/recent (история пользователя) --------
   query: userId, limit?, category?, q?
*/
router.get("/recent", async (req, res) => {
  const { userId, limit = "20", category, q } = req.query as any;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const L = Math.min(Math.max(parseInt(limit || "20"), 1), 50);

  const pipeline: any[] = [
    { $match: { userId: String(userId) } },
    { $sort: { updatedAt: -1 } },
    { $limit: L },
    {
      $lookup: {
        from: "videos",
        localField: "videoId",
        foreignField: "_id",
        as: "video",
      },
    },
    { $unwind: "$video" },
  ];

  if (category || q) {
    const m: any = {};
    if (category) m["video.category"] = category;
    if (q) {
      m.$or = [
        { "video.title": { $regex: q, $options: "i" } },
        { "video.channel": { $regex: q, $options: "i" } },
        { "video.tags": { $regex: q, $options: "i" } },
      ];
    }
    pipeline.push({ $match: m });
  }

  type ViewingAggResult = { video: any; progress?: number };
  const rows: ViewingAggResult[] = await Viewing.aggregate(pipeline);
  res.json({
    items: rows.map((r) => ({
      ...toDTO(r.video),
      progress: (r as any).progress ?? 0,
    })),
  });
});

/* -------- GET /api/videos/:id -------- */
router.get("/:id", async (req, res) => {
  const v = await Video.findById(req.params.id).lean();
  if (!v) return res.status(404).json({ error: "not found" });
  res.json({ item: toDTO(v) });
});

/* -------- POST /api/videos/:id/progress  (upsert) --------
   body: { userId, progress(0..1), lastPositionSec }
   бонус: если прогресс пересёк 10% впервые — инкрементируем viewCount.
*/
router.post("/:id/progress", async (req, res) => {
  const { userId, progress, lastPositionSec } = req.body ?? {};
  if (!userId || typeof progress !== "number") {
    return res.status(400).json({ error: "userId & progress required" });
  }
  const vidId = req.params.id;

  const prev = await Viewing.findOne({ userId, videoId: vidId }).lean();

  const viewStartedBefore = prev ? (prev as any).progress >= 0.1 : false;
  const nowStarted = progress >= 0.1;

  const up = await Viewing.findOneAndUpdate(
    { userId, videoId: vidId },
    { $set: { progress, lastPositionSec } },
    { upsert: true, new: true }
  ).lean();

  if (!viewStartedBefore && nowStarted) {
    await Video.findByIdAndUpdate(vidId, { $inc: { viewCount: 1 } });
  }

  res.json({ ok: true, progress: (up as any)?.progress ?? 0 });
});

/* -------- GET /api/videos/suggest?q=  (подсказки) -------- */
router.get("/suggest", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ items: [] });
  const rows = await Video.find(
    { title: { $regex: q, $options: "i" } },
    { title: 1 }
  )
    .sort({ viewCount: -1 })
    .limit(8)
    .lean();
  res.json({ items: rows.map((r) => r.title) });
});

/* -------- GET /api/categories -------- */
router.get("/categories", (_req, res) => {
  res.json(["Quran","Hadith","History","Creed","Manhaj","Fiqh","Sharia"]);
});

export default router;
