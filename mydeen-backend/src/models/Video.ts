import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

export type Category =
  | "Quran" | "Hadith" | "History" | "Creed" | "Manhaj" | "Fiqh" | "Sharia";

const videoSchema = new Schema(
  {
    youtubeId: { type: String, required: true, index: true },
    url: { type: String, required: true },         // полная ссылка на YouTube
    title: { type: String, required: true },
    channel: { type: String, default: "" },
    durationSec: { type: Number, default: null },  // можно не знать → null
    category: {
      type: String,
      enum: ["Quran","Hadith","History","Creed","Manhaj","Fiqh","Sharia"],
      required: true,
      index: true,
    },
    tags: { type: [String], default: [], index: true },
    publishedAt: { type: Date, default: Date.now, index: true },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// текстовый поиск по названию/каналу/тегам
videoSchema.index({ title: "text", channel: "text", tags: "text" });

export type VideoDoc = typeof videoSchema extends infer S ? S : never;
export default models.Video || model("Video", videoSchema);
