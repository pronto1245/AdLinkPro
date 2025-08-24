import express from "express";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === "publisher@test.com" && password === "Publisher@123") {
    return res.json({
      token: "sample-token",
      user: { email, role: "publisher" }
    });
  }

  return res.status(401).json({ message: "Неверный email или пароль" });
});

export default router;
