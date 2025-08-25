import { Router } from "express";
import mongoose from "mongoose";
import { CATEGORIES, FEATURED, LATEST, USERS } from "../data";
import { getPrayerTimes } from "../prayer";
import { qiblaBearing } from "../qibla";
import User from "../models/User";
import Article from "../models/Article";


const router = Router();
const DEFAULT_COORDS = { lat: 21.422487, lng: 39.826206 }; // Мекка

router.get("/", async (req, res) => {
  const userId = (req.query.userId as string) || "u1"; // может быть ObjectId или userCode
  type LeanUser = { _id: any; name?: string; avatar?: string; lat?: number; lng?: number };
  let user: LeanUser | null = null;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId).lean<LeanUser>();
  }
  if (!user) {
    user = await User.findOne({ userCode: userId }).lean<LeanUser>();
  }
  if (!user) {
    user = await User.findOne().lean<LeanUser>();
  }
  const featured = await Article.find({ category: "Quran" }).limit(10).lean();
  const latest = await Article.find().sort({ _id: -1 }).limit(10).lean();
  if (!user) {
    return res.status(404).json({ error: "No users configured" });
  }

  const latParam = Number(req.query.lat);
  const lngParam = Number(req.query.lng);

  const lat = !Number.isNaN(latParam) ? latParam : user.lat ?? DEFAULT_COORDS.lat;
  const lng = !Number.isNaN(lngParam) ? lngParam : user.lng ?? DEFAULT_COORDS.lng;

  const prayer = getPrayerTimes(lat, lng, new Date());

  const now = new Date();
  const order: [string, Date][] = [
    ["Fajr", prayer.fajr],
    ["Sunrise", prayer.sunrise],
    ["Dhuhr", prayer.dhuhr],
    ["Asr", prayer.asr],
    ["Maghrib", prayer.maghrib],
    ["Isha", prayer.isha],
  ];
  const nextPair = order.find(([, t]) => now < t) ?? ["Fajr", prayer.fajr];
  const nextPrayer = { name: nextPair[0], time: nextPair[1] };

  return res.json({
  user: { id: String(user._id), name: user.name, avatar: user.avatar },
    nextPrayer: {
      name: nextPrayer.name,
      iso: nextPrayer.time.toISOString(),
      hhmm: nextPrayer.time.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      ampm: nextPrayer.time
        .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        .split(" ")[1],
    },
    qibla: { bearing: qiblaBearing(lat, lng) },
    categories: CATEGORIES,
    featured: FEATURED,
    latest: LATEST,
  });
});

router.get("/categories", (_req, res) => res.json(CATEGORIES));

router.get("/featured", (req, res) => {
  const category = req.query.category as string | undefined;
  res.json(category ? FEATURED.filter((f) => f.category === category) : FEATURED);
});

router.get("/articles", (_req, res) => res.json(LATEST));

router.get("/prayer-times", (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "Provide lat & lng query params" });
    }
  const times = getPrayerTimes(lat, lng, new Date());
  res.json({
    fajr: times.fajr.toISOString(),
    sunrise: times.sunrise.toISOString(),
    dhuhr: times.dhuhr.toISOString(),
    asr: times.asr.toISOString(),
    maghrib: times.maghrib.toISOString(),
    isha: times.isha.toISOString(),
  });
});

router.get("/qibla", (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "Provide lat & lng query params" });
  }
  res.json({ bearing: qiblaBearing(lat, lng) });
});

export default router;
