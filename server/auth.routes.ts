import express, { Router } from "express";
import jwt from "jsonwebtoken";

export const authRouter = Router();
authRouter.use(express.json());

const users = [
  {
    email: process.env.OWNER_EMAIL || "9791207@gmail.com",
    password: process.env.OWNER_PASSWORD || "owner123",
    role: "OWNER",
    sub: "owner-1",
    username: "owner",
  },
  {
    email: process.env.ADVERTISER_EMAIL || "12345@gmail.com",
    password: process.env.ADVERTISER_PASSWORD || "adv123",
    role: "ADVERTISER",
    sub: "adv-1",
    username: "advertiser",
  },
  {
    email: process.env.PARTNER_EMAIL || "4321@gmail.com",
    password: process.env.PARTNER_PASSWORD || "partner123",
    role: "PARTNER",
    sub: "partner-1",
    username: "partner",
  },
];

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const user = users.find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "JWT_SECRET missing" });

  const token = jwt.sign(
    { sub: user.sub, role: user.role, email: user.email, username: user.username },
    secret,
    { expiresIn: "7d" }
  );
  return res.json({ token });
});
