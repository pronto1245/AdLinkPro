import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import express from "express";
import path from "path";
import { registerRoutes } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Путь к client/dist
const frontendPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(frontendPath));

// Роуты API
registerRoutes(app).then((server) => {
  // SPA fallback
  app.get("*", (_, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });

  // Запуск сервера
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
