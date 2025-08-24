import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const app = express()
const PORT = process.env.PORT || 8000

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use(express.static(join(__dirname, "public")))

app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"))
})

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
