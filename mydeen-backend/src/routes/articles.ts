import { Router } from "express";
import Article from "../models/Article";
import Reading from "../models/Reading";

const router = Router();

const toDTO = (a: any) => ({
  id: String(a._id),
  category: a.category,
  title: a.title,
  author: a.author,
  authorAvatar: a.authorAvatar,
  cover: a.cover,
  excerpt: a.excerpt,
});

router.get("/", async (req, res) => {
  const { category, q, cursor, limit = "20" } = req.query as any;
  const L = Math.min(Math.max(parseInt(limit || "20", 10), 1), 100);

  const filter: any = {};
  if (category) filter.category = category;

  if (q) {
    filter.$or = [
      { $text: { $search: q } },
      { title:   { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
      { tags:    { $regex: q, $options: "i" } },
      { author:  { $regex: q, $options: "i" } },
    ];
  }
  if (cursor) filter.publishedAt = { $lt: new Date(String(cursor)) };

  const rows = await Article.find(filter)
    .sort({ publishedAt: -1, _id: -1 })
    .limit(L + 1)
    .lean();

  const items = rows.slice(0, L).map(toDTO);
  const nextCursor = rows.length > L ? rows[L - 1].publishedAt : undefined;
  res.json({ items, nextCursor });
});

router.get("/:id", async (req, res) => {
  const a = await Article.findById(req.params.id).lean();
  if (!a) return res.status(404).json({ message: "Not found" });
  res.json({ item: { ...toDTO(a), content: a.content } });
});

router.get("/related/by", (_req, res) => res.status(404).end()); // заглушка для неверного пути

router.get("/related", async (req, res) => {
  const { id, limit = "6" } = req.query as any;
  const L = Math.min(Math.max(parseInt(limit || "6", 10), 1), 20);

  let base = null as any;
  if (id) base = await Article.findById(id).lean();
  if (!base) return res.json({ items: [] });

  // сначала по тем же тегам, затем добиваем по категории
  const tagFilter = base.tags?.length ? { tags: { $in: base.tags } } : {};
  const rows = await Article.find({
    _id: { $ne: base._id },
    category: base.category,
    ...tagFilter,
  })
    .sort({ publishedAt: -1 })
    .limit(L)
    .lean();

  res.json({ items: rows.map(toDTO) });
});

router.get("/continue", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.json({ item: null });

  const r = await Reading.findOne({ userId }).sort({ updatedAt: -1 }).lean();
  if (!r) return res.json({ item: null });

  const a = await Article.findById(r.articleId).lean();
  if (!a) return res.json({ item: null });

  res.json({ item: toDTO(a) });
});

router.post("/:id/progress", async (req, res) => {
  const { userId, progress } = req.body ?? {};
  if (!userId || typeof progress !== "number") {
    return res.status(400).json({ message: "userId & progress required" });
  }
  const updated = await Reading.findOneAndUpdate(
    { userId, articleId: req.params.id },
    { $set: { progress } },
    { upsert: true, new: true }
  ).lean();

  res.json({ ok: true, progress: updated.progress });
});

export default router;
