const URL = "http://localhost:3000/api/books"

const contenedor = document.getElementById("contenedor")
const loader = document.getElementById("loader")
const emptyState = document.getElementById("empty-state")
const sectionTitle = document.getElementById("section-title")

let cacheLibros = []

// ================= UTIL =================

function normalizar(texto){
  return texto
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
}

function showLoader(){
  loader.classList.remove("hidden")
  emptyState.classList.add("hidden")
  contenedor.innerHTML = ""
}

function hideLoader(){
  loader.classList.add("hidden")
}

function showError(title, msg, isError = false){
  emptyState.classList.remove("hidden")
  
  if (isError) {
    emptyState.classList.add("error")
  } else {
    emptyState.classList.remove("error")
  }

  document.getElementById("empty-title").innerText = title
  document.getElementById("empty-desc").innerText = msg
  contenedor.innerHTML = ""
}

function clearUI(){
  contenedor.innerHTML = ""
  emptyState.classList.add("hidden")
  loader.classList.add("hidden")
  const filtrosContainer = document.getElementById("filtros-container")
  if (filtrosContainer) filtrosContainer.innerHTML = ""
}

function setActiveMenu(btnId) {
  document.querySelectorAll('.menu button').forEach(btn => btn.classList.remove('active'))
  if(btnId) {
    const btn = document.getElementById(btnId)
    if(btn) btn.classList.add('active')
  }
}

function renderLibros(libros, titleText){
  if(titleText) sectionTitle.innerText = titleText
  
  contenedor.innerHTML = ""

  if(!libros || libros.length === 0) {
    showError("Sin resultados", "No encontramos libros para tu búsqueda.")
    return
  }

  libros.forEach(libro=>{
    // Soporte para estructura normal o dentro de "book_details"
    const title = libro.title || (libro.book_details && libro.book_details[0].title) || "Sin título"
    const author = libro.author || (libro.book_details && libro.book_details[0].author) || "Desconocido"
    const desc = libro.description || (libro.book_details && libro.book_details[0].description) || "Sin descripción disponible."
    
    // Imagen segura o placeholder si falta
    const img = libro.book_image || "https://fakeimg.pl/300x450/1e293b/f8fafc/?text=Sin+Portada&font=inter"

    contenedor.innerHTML += `
    <div class="card fade-in">
      <img src="${img}" alt="${title}" loading="lazy" onerror="this.src='https://fakeimg.pl/300x450/1e293b/f8fafc/?text=Fail&font=inter'">
      <h3>${title}</h3>
      <p class="author">${author}</p>
      <p class="desc">${desc}</p>
    </div>
    `
  })
}

// ================= CACHE =================

async function cargarLibros(){
  if(cacheLibros.length > 0) return cacheLibros

  const res = await fetch(`${URL}/bestsellers`)
  const data = await res.json()

  cacheLibros = data.results.books || data.results
  return cacheLibros
}

// ================= BEST SELLERS =================

async function bestSellers(){
  setActiveMenu('btn-bestsellers')
  clearUI()
  showLoader()

  try{
    const libros = await cargarLibros()
    renderLibros(libros, "Best Sellers")
  }catch{
    showError("Error", "No pudimos cargar los best sellers", true)
  } finally {
    hideLoader()
  }
}

// ================= BUSCAR TITULO =================

async function buscarTitulo(){
  const input = document.getElementById("inputTitulo")
  const titulo = input.value.trim()

  if(!titulo){
    showError("Aviso", "Por favor ingresa un título para buscar")
    return
  }

  setActiveMenu(null)
  clearUI()
  showLoader()
  sectionTitle.innerText = `Búsqueda: "${titulo}"`

  try{
    const libros = await cargarLibros()
    const filtrados = libros.filter(libro =>
      normalizar(libro.title || "").includes(normalizar(titulo))
    )

    if(filtrados.length === 0){
      showError("Sin resultados", `No encontramos "${titulo}" en los best sellers.`)
    } else {
      renderLibros(filtrados)
      input.value = ""
    }
  }catch{
    showError("Error", "Error al buscar por título", true)
  } finally {
    hideLoader()
  }
}

// ================= BUSCAR AUTOR =================

async function buscarAutor(){
  const input = document.getElementById("inputAutor")
  const autor = input.value.trim()

  if(!autor){
    showError("Aviso", "Por favor ingresa el nombre de un autor")
    return
  }

  setActiveMenu(null)
  clearUI()
  showLoader()
  sectionTitle.innerText = `Autor: "${autor}"`

  try{
    const libros = await cargarLibros()
    const filtrados = libros.filter(libro =>
      normalizar(libro.author || "").includes(normalizar(autor))
    )

    if(filtrados.length === 0){
      showError("Sin resultados", `No encontramos libros de "${autor}".`)
    } else {
      renderLibros(filtrados)
      input.value = ""
    }
  }catch{
    showError("Error", "Error al buscar por autor", true)
  } finally {
    hideLoader()
  }
}

// ================= BUSCAR FECHA (NUEVO) =================
async function buscarPorFecha(){
  const input = document.getElementById("inputFecha")
  const fecha = input.value

  if(!fecha){
    showError("Aviso", "Por favor selecciona una fecha")
    return
  }

  setActiveMenu(null)
  clearUI()
  showLoader()
  sectionTitle.innerText = `Libros por fecha: ${fecha}`

  try{
    const res = await fetch(`${URL}/date?date=${fecha}`)
    const data = await res.json()
    
    if(data.error || !data.results){
      showError("Error", "No pudimos obtener datos para esa fecha.", true)
      return
    }

    // La API del NYT retorna datos organizados de manera ligeramente distinta
    const results = Array.isArray(data.results) ? data.results : data.results.books;
    renderLibros(results)
  }catch{
    showError("Error", "Ocurrió un error consultando la API", true)
  } finally {
    hideLoader()
  }
}

// ================= CATEGORIAS =================

const CATEGORIAS_POPULARES = [
  { encoded: "hardcover-fiction", display: "Ficción Tapa Dura" },
  { encoded: "paperback-nonfiction", display: "No Ficción Tapa Blanda" },
  { encoded: "e-book-fiction", display: "E-Book Ficción" },
  { encoded: "hardcover-nonfiction", display: "No Ficción Tapa Dura" },
  { encoded: "childrens-middle-grade-hardcover", display: "Juvenil Tapa Dura" },
  { encoded: "young-adult-hardcover", display: "Adultos Jóvenes Tapa Dura" },
  { encoded: "picture-books", display: "Libros Ilustrados" },
  { encoded: "series-books", display: "Series" },
  { encoded: "mass-market-paperback", display: "Libros de Bolsillo" },
  { encoded: "audio-fiction", display: "Audio Ficción" },
  { encoded: "audio-nonfiction", display: "Audio No Ficción" },
  { encoded: "graphic-books-and-manga", display: "Novelas Gráficas y Manga" },
  { encoded: "business-books", display: "Negocios" },
  { encoded: "sports", display: "Deportes" },
  { encoded: "science", display: "Ciencia" }
];

async function verCategorias(){
  setActiveMenu('btn-categorias')
  clearUI()
  sectionTitle.innerText = "Explorar por Categoría"

  const filtrosContainer = document.getElementById("filtros-container")
  
  let optionsHtml = '<option value="">-- Selecciona una categoría --</option>'
  CATEGORIAS_POPULARES.forEach(cat => {
    optionsHtml += `<option value="${cat.encoded}">${cat.display}</option>`
  })

  filtrosContainer.innerHTML = `
    <div class="category-select-wrapper fade-in">
      <select id="categoryDropdown" onchange="seleccionarCategoria()">
        ${optionsHtml}
      </select>
    </div>
  `
  
  contenedor.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1; min-height: 200px;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
      <p style="margin-top: 10px; color: var(--text-secondary);">Selecciona una categoría arriba para visualizar sus libros.</p>
    </div>
  `
}

function seleccionarCategoria() {
  const dropdown = document.getElementById("categoryDropdown")
  const selectedEncoded = dropdown.value
  const selectedDisplay = dropdown.options[dropdown.selectedIndex].text
  
  if (selectedEncoded) {
    verLibrosCategoria(selectedEncoded, selectedDisplay)
  } else {
    contenedor.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; min-height: 200px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
        <p style="margin-top: 10px; color: var(--text-secondary);">Selecciona una categoría arriba para visualizar sus libros.</p>
      </div>
    `
  }
}


// ================= LIBROS POR CATEGORIA =================

async function verLibrosCategoria(categoriaEncoded, nombreDisplay){
  clearUI()
  showLoader()
  sectionTitle.innerText = nombreDisplay || "Categoría"

  try{
    const res = await fetch(`${URL}/category?category=${categoriaEncoded}`)
    const data = await res.json()

    if(data.error){
      showError("Error", "Categoría no válida o sin acceso.", true)
      return
    }

    renderLibros(data.results.books || data.results)

  }catch{
    showError("Error", "Fallo al cargar la lista de libros", true)
  } finally {
    hideLoader()
  }
}

// ================= HISTORIAL =================

async function verHistorial(){
  const titulo = prompt("Ingrese el título a buscar en el historial de NYT:")
  if(!titulo) return

  setActiveMenu('btn-historial')
  clearUI()
  showLoader()
  sectionTitle.innerText = `Historial: "${titulo}"`

  try{
    const res = await fetch(`${URL}/history?title=${encodeURIComponent(titulo)}`)
    const data = await res.json()

    if(data.error || !data.results || data.results.length === 0){
      showError("Sin Resultados", "No encontramos este libro en el historial.")
      return
    }

    // Adaptar los campos retornados por el endpoint history
    const mapeado = data.results.map(item => ({
      title: item.title,
      author: item.author,
      description: item.description,
      book_image: "" 
    }))

    renderLibros(mapeado)
  }catch{
    showError("Error", "Fallo obteniendo el historial", true)
  } finally {
    hideLoader()
  }
}

// Inicializar al cargar
window.addEventListener('DOMContentLoaded', () => {
  bestSellers();
});

// ================= PWA SERVICE WORKER =================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('ServiceWorker registrado con éxito:', reg.scope))
      .catch(err => console.log('Error al registrar el ServiceWorker:', err));
  });
}