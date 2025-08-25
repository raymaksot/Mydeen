import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Video from './models/Video';
import Article from './models/Article';
import User from './models/User';

const MONGO_URI = 'mongodb://localhost:27017/server';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected');

  // Optional: clean collections (comment out if not desired)
  // await Promise.all([
  //   Video.deleteMany({}),
  //   Article.deleteMany({}),
  //   User.deleteMany({}),
  // ]);

  /* ---- Users ---- */
  const usersData = [
    { name: 'Admin', email: 'admin@example.com', password: 'admin123' },
    { name: 'User One', email: 'user1@example.com', password: 'password1' },
  ];
  const userDocs = [] as any[];
  for (const u of usersData) {
    const existing = await User.findOne({ email: u.email });
    if (existing) { userDocs.push(existing); continue; }
    const passwordHash = await bcrypt.hash(u.password, 10);
    const doc = await User.create({ name: u.name, email: u.email, passwordHash });
    userDocs.push(doc);
  }
  console.log('Users ready:', userDocs.length);

  /* ---- Articles ---- */
  const articles = [
    { tag: 'intro', title: 'Введение в Коран', author: 'Имам Али', image: 'quran1.jpg', category: 'Quran' },
    { tag: 'hadith-basics', title: 'Основы хадисов', author: 'Шейх Бухари', image: 'hadith1.jpg', category: 'Hadith' },
  ];
  for (const a of articles) {
    await Article.updateOne({ tag: a.tag }, { $setOnInsert: a }, { upsert: true });
  }
  console.log('Articles upserted:', articles.length);

  /* ---- Videos ---- */
  const videos = [
    {
      youtubeId: 'dQw4w9WgXcQ',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Example Video 1',
      channel: 'Channel One',
      durationSec: 210,
      category: 'Quran' as const,
      tags: ['islam', 'quran'],
      publishedAt: new Date('2023-01-01'),
      viewCount: 100,
      likeCount: 10,
    },
    {
      youtubeId: 'eY52Zsg-KVI',
      url: 'https://www.youtube.com/watch?v=eY52Zsg-KVI',
      title: 'Example Video 2',
      channel: 'Channel Two',
      durationSec: 180,
      category: 'Hadith' as const,
      tags: ['hadith', 'education'],
      publishedAt: new Date('2023-02-01'),
      viewCount: 200,
      likeCount: 20,
    },
  ];
  for (const v of videos) {
    await Video.updateOne({ youtubeId: v.youtubeId }, { $setOnInsert: v }, { upsert: true });
  }
  console.log('Videos upserted:', videos.length);

  await mongoose.disconnect();
  console.log('Done');
}

run().catch(e => { console.error(e); process.exit(1); });
