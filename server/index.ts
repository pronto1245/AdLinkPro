import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import express from "express";
import path from "path";
import { registerRoutes } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Add static file serving before registering API routes
const frontendPath = path.join(__dirname, "..", "dist");
app.use(express.static(frontendPath));

// Register all API routes and middleware
registerRoutes(app).then((server) => {
  // Add SPA fallback after all API routes are registered
  app.get("*", (_, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });

  // Start the server
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
