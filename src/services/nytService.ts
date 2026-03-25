import axios from "axios"

const API_KEY = "FEaVxAmbMBRngYkdZLRzGr5tBkJrfqm1Be1iiwkSPRAqjBV9"
const BASE_URL = "https://api.nytimes.com/svc/books/v3"

// 1. Best sellers (DINÁMICO)
export const getBestSellers = async () => {
  try {
    const category = "childrens-middle-grade-hardcover" // 🔥 CORRECTO

    const res = await axios.get(
      `${BASE_URL}/lists/current/${category}.json`,
      {
        params: { "api-key": API_KEY }
      }
    )

    return res.data

  } catch (error: any) {
    console.error("ERROR getBestSellers:", error.response?.data || error.message)

    return {
      error: true,
      message: "Error obteniendo best sellers"
    }
  }
}

// 2. Buscar por título
export const searchByTitle = async (title: string) => {
  if (!title) {
    return { error: true, message: "Título vacío" }
  }

  try {
    const res = await axios.get(
      `${BASE_URL}/reviews.json`,
      {
        params: {
          title,
          "api-key": API_KEY
        }
      }
    )

    return res.data

  } catch (error: any) {
    console.error("ERROR searchByTitle:", error.response?.data || error.message)

    return {
      error: true,
      message: "No se encontraron reviews"
    }
  }
}

// 3. Buscar por autor
export const searchByAuthor = async (author: string) => {
  if (!author) {
    return { error: true, message: "Autor vacío" }
  }

  try {
    const res = await axios.get(
      `${BASE_URL}/reviews.json`,
      {
        params: {
          author,
          "api-key": API_KEY
        }
      }
    )

    return res.data

  } catch (error: any) {
    console.error("ERROR searchByAuthor:", error.response?.data || error.message)

    return {
      error: true,
      message: "No se encontraron resultados"
    }
  }
}

// 4. Categorías
export const getCategories = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/lists/names.json`,
      {
        params: { "api-key": API_KEY }
      }
    )

    return res.data

  } catch (error: any) {
    console.error("ERROR getCategories:", error.response?.data || error.message)

    return {
      error: true,
      message: "Error cargando categorías"
    }
  }
}

// 5. Historial
export const getHistory = async (title: string) => {
  if (!title) {
    return { error: true, message: "Título vacío" }
  }

  try {
    const res = await axios.get(
      `${BASE_URL}/lists/best-sellers/history.json`,
      {
        params: {
          title,
          "api-key": API_KEY
        }
      }
    )

    return res.data

  } catch (error: any) {
    console.error("ERROR getHistory:", error.response?.data || error.message)

    return {
      error: true,
      message: "No se encontró historial"
    }
  }
}

// 6. Buscar por fecha
export const searchByDate = async (date: string) => {
  if (!date) {
    return { error: true, message: "Fecha vacía" }
  }

  try {
    const list = "hardcover-fiction"
    const res = await axios.get(
      `${BASE_URL}/lists/${date}/${list}.json`,
      {
        params: { "api-key": API_KEY }
      }
    )

    return res.data

  } catch (error: any) {
    console.error("ERROR searchByDate:", error.response?.data || error.message)

    return {
      error: true,
      message: "No se encontraron resultados para la fecha"
    }
  }
}