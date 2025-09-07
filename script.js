document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");
  const generoFilter = document.getElementById("genero-filter");
  const categoriaFilter = document.getElementById("categoria-filter");
  const clearFilters = document.getElementById("clear-filters");

  let productos = [];
  let categoriasUnicas = new Set();

  try {
    const response = await fetch("productos.json");
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    productos = await response.json();

    // Extraer categorías únicas para el filtro
    productos.forEach(p => categoriasUnicas.add(p.categoria));
    const categoriasOrdenadas = [...categoriasUnicas].sort();

    // Llenar el select de categorías
    categoriasOrdenadas.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoriaFilter.appendChild(option);
    });

    // Función para renderizar productos
    function renderizarProductos(filtroGenero = "", filtroCategoria = "") {
      catalogo.innerHTML = ""; // Limpiar

      const productosFiltrados = productos.filter(p => {
        const coincideGenero = !filtroGenero || p.genero === filtroGenero;
        const coincideCategoria = !filtroCategoria || p.categoria === filtroCategoria;
        return coincideGenero && coincideCategoria;
      });

      if (productosFiltrados.length === 0) {
        const div = document.createElement("div");
        div.className = "seccion";
        div.innerHTML = `<p style="color: #aaa; text-align: center; padding: 2rem;">No hay productos que coincidan con los filtros.</p>`;
        catalogo.appendChild(div);
        return;
      }

      // Agrupar por género y categoría
      const productosPorGenero = {};
      productosFiltrados.forEach(prod => {
        if (!productosPorGenero[prod.genero]) productosPorGenero[prod.genero] = {};
        if (!productosPorGenero[prod.genero][prod.categoria]) productosPorGenero[prod.genero][prod.categoria] = [];
        productosPorGenero[prod.genero][prod.categoria].push(prod);
      });

      for (const genero in productosPorGenero) {
        const seccionDiv = document.createElement("div");
        seccionDiv.className = "seccion";

        const tituloGenero = document.createElement("h2");
        tituloGenero.textContent = `Sección ${genero}`;
        seccionDiv.appendChild(tituloGenero);

        const categorias = productosPorGenero[genero];
        for (const categoria in categorias) {
          const categoriaDiv = document.createElement("div");
          categoriaDiv.className = "categoria";

          const tituloCat = document.createElement("h3");
          tituloCat.textContent = categoria;
          categoriaDiv.appendChild(tituloCat);

          const grid = document.createElement("div");
          grid.className = "productos-grid";

          categorias[categoria].forEach(producto => {
            const descuento = Math.round(
              ((producto.precioOriginal - producto.precioRebajado) / producto.precioOriginal) * 100
            );

            const card = document.createElement("div");
            card.className = "card";

            const imgPath = `https://tayllefert10.github.io/prueba/images/${producto.colores[0].imagen}`;
            const imgId = generarId(producto.nombre);

            const colorOptions = producto.colores.map((color, index) => {
              const isActive = index === 0 ? "active" : "";
              return `
                <div 
                  class="color-option ${isActive}"
                  style="background-image: url('https://tayllefert10.github.io/prueba/images/${color.imagen}'); background-size: cover;"
                  data-img="${color.imagen}"
                  title="${color.nombre}"
                ></div>
              `;
            }).join("");

            card.innerHTML = `
              <div class="img-container">
                <span class="discount-badge">-${descuento}%</span>
                <img id="${imgId}" src="${imgPath}" alt="${producto.nombre}" onerror="this.src='https://picsum.photos/200/200'">
              </div>
              <div class="card-content">
                <h3 class="card-title">${producto.nombre}</h3>
                ${producto.descripcion ? `<p class="card-description">${producto.descripcion}</p>` : ''}
                <div class="color-selector">${colorOptions}</div>
                <div class="price-container">
                  <span class="price-original">${producto.precioOriginal.toFixed(2)}€</span>
                  <span class="price-discount">${producto.precioRebajado.toFixed(2)}€</span>
                </div>
              </div>
            `;

            const mainImg = card.querySelector(`#${imgId}`);
            card.querySelectorAll(".color-option").forEach(option => {
              option.addEventListener("click", () => {
                const newImg = option.getAttribute("data-img");
                mainImg.src = `https://tayllefert10.github.io/prueba/images/${newImg}`;
                option.parentNode.querySelectorAll(".color-option").forEach(el => el.classList.remove("active"));
                option.classList.add("active");
              });
            });

            grid.appendChild(card);
          });

          categoriaDiv.appendChild(grid);
          seccionDiv.appendChild(categoriaDiv);
        }

        catalogo.appendChild(seccionDiv);
      }
    }

    // Función para generar ID seguro
    function generarId(nombre) {
      return "img-" + nombre
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    // Eventos de filtro
    generoFilter.addEventListener("change", () => {
      renderizarProductos(generoFilter.value, categoriaFilter.value);
    });

    categoriaFilter.addEventListener("change", () => {
      renderizarProductos(generoFilter.value, categoriaFilter.value);
    });

    clearFilters.addEventListener("click", () => {
      generoFilter.value = "";
      categoriaFilter.value = "";
      renderizarProductos();
    });

    // Renderizar todos al inicio
    renderizarProductos();

  } catch (error) {
    catalogo.innerHTML = `
      <div class="seccion">
        <p style="color: #e63946; font-size: 1.2rem; text-align: center; padding: 1rem;">
          ⚠️ Error al cargar productos: ${error.message}
        </p>
      </div>
    `;
  }
});
