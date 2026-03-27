import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import booksRoutes from "./routes/books.js"

// FIX __dirname (PRIMERO SIEMPRE)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// middlewares
app.use(cors())
app.use(express.json())

// ================= API =================
app.use("/api/books", booksRoutes)

// ================= FRONTEND =================

// servir archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend")))

// fallback (para SPA o rutas directas)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// ================= SERVER =================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})