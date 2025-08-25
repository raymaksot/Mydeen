import { Schema, model, models } from "mongoose";

export type Category =
  | "Quran" | "Hadith" | "History" | "Creed" | "Manhaj" | "Fiqh" | "Sharia";

const articleSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["Quran","Hadith","History","Creed","Manhaj","Fiqh","Sharia"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, index: true },
    author: { type: String, required: true, index: true },
    authorAvatar: { type: String, default: "" },
    cover: { type: String, default: "" },   // URL картинки
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// полнотекстовый поиск
articleSchema.index({ title: "text", content: "text", tags: "text", author: "text" });

export default models.Article || model("Article", articleSchema);
