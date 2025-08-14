import express from "express";
const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
