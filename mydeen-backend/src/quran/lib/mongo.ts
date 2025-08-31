import mongoose from 'mongoose';

export async function connectMongo(uri = process.env.MONGO_URI!) {
  if (!uri) throw new Error('MONGO_URI is required');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  return mongoose.connection;
}

/** MODELS **/

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    surahId: { type: Number, required: true },
    ayahNumber: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'progress' }
);

const PrefsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    reciterId: { type: String, default: 'default' },
    speed: { type: Number, default: 1.0, min: 0.5, max: 2 },
    translationLang: { type: String, default: 'en' },
    autoplayNext: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'prefs' }
);

export const ProgressModel = mongoose.model('Progress', ProgressSchema);
export const PrefsModel = mongoose.model('Prefs', PrefsSchema);

/** REPOSITORY HELPERS **/

export async function repoGetProgress(userId: string) {
  return ProgressModel.findOne({ userId }).lean<{ userId: string; surahId: number; ayahNumber: number }>().exec();
}

export async function repoSetProgress(userId: string, surahId: number, ayahNumber: number) {
  await ProgressModel.updateOne(
    { userId },
    { $set: { surahId, ayahNumber, updatedAt: new Date() } },
    { upsert: true }
  ).exec();
}

export async function repoGetPrefs(userId: string) {
  const d = await PrefsModel.findOne({ userId }).lean().exec();
  return d ?? { userId, reciterId: 'default', speed: 1.0, translationLang: 'en', autoplayNext: true };
}

export async function repoSetPrefs(userId: string, p: Partial<{ reciterId: string; speed: number; translationLang: string; autoplayNext: boolean }>) {
  await PrefsModel.updateOne(
    { userId },
    { $set: { ...p, updatedAt: new Date() } },
    { upsert: true }
  ).exec();
}
