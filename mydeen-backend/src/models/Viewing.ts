import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const viewingSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true, index: true },
    progress: { type: Number, default: 0 },       // 0..1
    lastPositionSec: { type: Number, default: 0 },
  },
  { timestamps: true }
);

viewingSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export default models.Viewing || model("Viewing", viewingSchema);
