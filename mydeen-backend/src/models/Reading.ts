import { Schema, model, models } from "mongoose";

const readingSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true, index: true },
    progress: { type: Number, default: 0 }, // 0..1
  },
  { timestamps: true }
);

readingSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export default models.Reading || model("Reading", readingSchema);
