import express, { Router } from "express";
import jwt from "jsonwebtoken";

export const devLoginRouter = Router();
devLoginRouter.use(express.json());

const users = [
  {
    email: process.env.OWNER_EMAIL || "9791207@gmail.com",
    password: process.env.OWNER_PASSWORD || "77GeoDav=",
    role: "super_admin",
    sub: "owner-1",
    username: "owner",
  },
  {
    email: process.env.ADVERTISER_EMAIL || "6484488@gmail.com",
    password: process.env.ADVERTISER_PASSWORD || "7787877As",
    role: "advertiser",
    sub: "adv-1",
    username: "requester",
  },
  {
    email: process.env.PARTNER_EMAIL || "pablota096@gmail.com",
    password: process.env.PARTNER_PASSWORD || "7787877As",
    role: "affiliate",
    sub: "partner-1",
    username: "partner",
  },
];

devLoginRouter.post("/login", (req, res) => {
  const body = req.body || {};
  const email = (body.email || body.username || "").toLowerCase();
  const password = body.password || "";
  if (!email || !password) {
    return res.status(400).json({ error: "email/username and password are required" });
  }
  const user = users.find(u => u.email.toLowerCase() === email);
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
