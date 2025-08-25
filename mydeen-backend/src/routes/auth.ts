import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

const router = Router();

// НЕ пишем /api здесь! Только относительный путь:
router.post("/register", async (req, res) => {
  const { name, email, password, userCode } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }
  // Проверяем конфликт по email (обязателен) и опционально по userCode
  const clash = await User.findOne(
    userCode ? { $or: [{ email }, { userCode }] } : { email }
  ).lean();
  if (clash) return res.status(409).json({ message: "Email or userCode already registered" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash: hash, userCode });
  return res.status(201).json({ id: String(user._id), code: user.userCode, name: user.name, email: user.email });
});

// Логин
router.post("/login", async (req, res) => {
  const { email, password, userCode } = req.body ?? {};
  if ((!email && !userCode) || !password) {
    return res.status(400).json({ message: "email or userCode & password required" });
  }
  const user = await User.findOne(email ? { email } : { userCode });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  return res.json({ id: String(user._id), code: user.userCode, name: user.name, email: user.email });
});

export default router;
