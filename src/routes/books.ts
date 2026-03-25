import { Router } from "express"
import {
  getBestSellers,
  searchByTitle,
  searchByAuthor,
  getCategories,
  getHistory,
  searchByDate
} from "../services/nytService.js"

const router = Router()

// 1. Best sellers
router.get("/bestsellers", async (req, res) => {
  try {
    const data = await getBestSellers()
    res.json(data)
  } catch {
    res.status(500).json({ error: "Error al obtener best sellers" })
  }
})

// 2. Buscar por título
router.get("/title", async (req, res) => {
  try {
    const { title } = req.query

    if (!title) {
      return res.status(400).json({ error: "Falta el parámetro title" })
    }

    const data = await searchByTitle(title as string)
    res.json(data)
  } catch {
    res.status(500).json({ error: "Error al buscar por título" })
  }
})

// 3. Buscar por autor
router.get("/author", async (req, res) => {
  try {
    const { author } = req.query

    if (!author) {
      return res.status(400).json({ error: "Falta el parámetro author" })
    }

    const data = await searchByAuthor(author as string)
    res.json(data)
  } catch {
    res.status(500).json({ error: "Error al buscar por autor" })
  }
})

router.get("/category", async (req, res) => {
  let { category } = req.query

  // 🔥 DEBUG (IMPORTANTE)
  console.log("CATEGORIA RECIBIDA:", category)

  // 🔥 VALIDACIÓN FUERTE
  if (!category || category === "undefined") {
    return res.status(400).json({ error: "Categoría inválida" })
  }

  try {
    const response = await fetch(
      `https://api.nytimes.com/svc/books/v3/lists/current/${category}.json?api-key=FEaVxAmbMBRngYkdZLRzGr5tBkJrfqm1Be1iiwkSPRAqjBV9`
    )

    const data = await response.json()

    // 🔥 CONTROL DE ERROR REAL
    if (data.status === "ERROR") {
      return res.status(400).json({
        error: "Categoría no válida",
        detalle: data.errors
      })
    }

    res.json(data)

  } catch (error) {
    console.error("ERROR CATEGORY:", error)
    res.status(500).json({ error: "Error cargando categoría" })
  }
})

// 4. Obtener Todas las Categorías
router.get("/categories", async (req, res) => {
  try {
    const data = await getCategories()
    res.json(data)
  } catch {
    res.status(500).json({ error: "Error al obtener categorías" })
  }
})

// 6. Historial
router.get("/history", async (req, res) => {
  try {
    const { title } = req.query

    if (!title) {
      return res.status(400).json({ error: "Falta el parámetro title" })
    }

    const data = await getHistory(title as string)
    res.json(data)
  } catch {
    res.status(500).json({ error: "Error al obtener historial" })
  }
})

// 7. Buscar por fecha
router.get("/date", async (req, res) => {
  try {
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ error: "Falta el parámetro date" })
    }

    const data = await searchByDate(date as string)
    res.json(data)
  } catch {
    res.status(500).json({ error: "Error al buscar por fecha" })
  }
})

export default router