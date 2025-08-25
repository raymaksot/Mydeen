import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import authRouter from "./routes/auth";
import homeRouter from "./routes/home";
import videosRouter from "./routes/videos";
import articlesRouter from "./routes/articles";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Монтируем РОВНО под /api
app.use("/api", authRouter);
app.use("/api/home", homeRouter);
app.use("/api/videos", videosRouter);
app.use("/api/articles", articlesRouter);

// 404 JSON fallback (важно для мобильного клиента, чтобы не получать HTML)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'not_found', path: req.originalUrl });
  }
  next();
});

// Глобальный обработчик ошибок (JSON)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API error:', err);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ error: 'internal_error', message: err.message });
});

const PORT = 4000;
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => console.log(`API http://0.0.0.0:${PORT}`));
});
