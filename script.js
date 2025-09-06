document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");

  try {
    const response = await fetch("productos.json");
    const productos = await response.json();

    // Agrupar por género y categoría
    const productosPorGenero = {};

    productos.forEach(prod => {
      if (!productosPorGenero[prod.genero]) {
        productosPorGenero[prod.genero] = {};
      }
      if (!productosPorGenero[prod.genero][prod.categoria]) {
        productosPorGenero[prod.genero][prod.categoria] = [];
      }
      productosPorGenero[prod.genero][prod.categoria].push(prod);
    });

    // Generar catálogo
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
          // Calcular descuento
          const descuento = Math.round(
            ((producto.precioOriginal - producto.precioRebajado) / producto.precioOriginal) * 100
          );

          const card = document.createElement("div");
          card.className = "card";

          // Imagen principal (primera variante)
          const imgPath = `https://tayllefert10.github.io/prueba/images/${producto.colores[0].imagen}`;

          // Generar círculos de color
          const colorOptions = producto.colores.map((color, index) => {
            const isActive = index === 0 ? "active" : "";
            return `
              <div 
                class="color-option ${isActive}"
                style="background-image: url('https://tayllefert10.github.io/prueba/images/${color.imagen}'); background-size: cover; background-position: center;"
                data-img="${color.imagen}"
                data-name="${color.nombre}"
                title="${color.nombre}"
              ></div>
            `;
          }).join("");

          card.innerHTML = `
            <div style="position: relative;">
              <span class="discount-badge">-${descuento}%</span>
              <div class="img-container">
                <img 
                  src="${imgPath}" 
                  alt="${producto.nombre}" 
                  id="img-${producto.nombre.replace(/\s+/g, '-').toLowerCase()}"
                  onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'"
                >
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">${producto.nombre}</h3>
              ${producto.descripcion ? `<p style='font-size:0.95rem; color:#555; margin-bottom:0.5rem;'>${producto.descripcion}</p>` : ''}
              <div class="color-selector">
                ${colorOptions}
              </div>
              <div class="price-container">
                <span class="price-original">${producto.precioOriginal.toFixed(2)}€</span>
                <span class="price-discount">${producto.precioRebajado.toFixed(2)}€</span>
              </div>
            </div>
          `;

          // Añadir eventos a los círculos de color
          card.querySelectorAll(".color-option").forEach(option => {
            option.addEventListener("click", () => {
              const imgId = `img-${producto.nombre.replace(/\s+/g, '-').toLowerCase()}`;
              const mainImg = document.getElementById(imgId);
              const newImg = option.getAttribute("data-img");
              const newSrc = `https://tayllefert10.github.io/prueba/images/${newImg}`;
              mainImg.src = newSrc;

              // Actualizar activo
              card.querySelectorAll(".color-option").forEach(el => {
                el.classList.remove("active");
              });
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
  } catch (error) {
    catalogo.innerHTML = `
      <div class="seccion">
        <p style="color: red; font-size: 1.2rem; text-align: center;">
          ⚠️ Error al cargar productos: ${error.message}
        </p>
      </div>
    `;
  }
});
