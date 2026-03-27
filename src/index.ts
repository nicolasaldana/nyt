import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import booksRoutes from "./routes/books.js"


console.log("VERSION NUEVA FUNCIONANDO")
// ================= FIX __dirname =================
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ================= MIDDLEWARES =================
app.use(cors())
app.use(express.json())

// ================= API =================
app.use("/api/books", booksRoutes)

// ================= FRONTEND =================

// ruta absoluta al frontend
const frontendPath = path.resolve(process.cwd(), "frontend")

app.use(express.static(frontendPath))

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"))
})

// ================= SERVER =================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})