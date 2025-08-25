import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    userCode: { type: String, unique: true, sparse: true, index: true }, // короткий человеко-читаемый ID
    avatar: String,
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

// Авто‑генерация userCode если отсутствует
userSchema.pre("save", function(next) {
  if (!this.userCode) {
    this.userCode = `u${String(this._id).slice(-6)}`;
  }
  next();
});

export default models.User || model("User", userSchema);
