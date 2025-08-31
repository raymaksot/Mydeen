import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan' ;
import rateLimit from 'express-rate-limit';

import quranRoutes from './routes/quran.js';
import userRoutes from './routes/user.js';
import { connectMongo } from './lib/mongo';

const PORT = Number(process.env.PORT || 4000);

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

// примитивная идентификация пользователя
app.use((req, _res, next) => {
  (req as any).userId = (req.header('x-user-id') || 'guest').toString();
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use(quranRoutes);
app.use(userRoutes);


try {
  await connectMongo(process.env.MONGODB_URI || process.env.MONGO_URI || '');
  console.log('MongoDB connected');
} catch (err) {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}

// Если используется SQLite, раскомментируйте:
// ensureDb();

app.listen(PORT, () => console.log(`BFF listening on :${PORT}`));
