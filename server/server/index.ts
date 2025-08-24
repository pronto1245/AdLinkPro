import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import authRoutes from "./routes/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8000;

app.use(express.json());
app.use("/api/auth", authRoutes);

// Статичный фронт
const frontendPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(frontendPath));
app.get("*", (_, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
