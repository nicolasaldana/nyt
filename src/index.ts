import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import booksRoutes from "./routes/books.js"

const app = express()

// fix __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// middlewares
app.use(cors())
app.use(express.json())

// API
app.use("/api/books", booksRoutes)

// ================= FRONTEND =================

// servir archivos estáticos (RAÍZ DEL PROYECTO)
app.use(express.static(path.resolve(__dirname, "..", "frontend")))

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "index.html"))
})

// ================= SERVER =================

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})