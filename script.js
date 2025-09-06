document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");

  try {
    const response = await fetch("productos.json");
    const productos = await response.json();

    // Aseguramos que los precios sean números
    productos.forEach(prod => {
      prod.precioOriginal = parseFloat(prod.precioOriginal) || 0;
      prod.precioRebajado = parseFloat(prod.precioRebajado) || 0;
      // Calcular descuento automáticamente
      prod.descuento = Math.round(((prod.precioOriginal - prod.precioRebajado) / prod.precioOriginal) * 100);
    });

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

    // Generar el catálogo
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

        categorias[categoria].forEach(prod => {
          const card = document.createElement("div");
          card.className = "card";

          const imgPath = `https://tayllefert10.github.io/prueba/images/${prod.imagen}`;

          card.innerHTML = `
            <div style="position: relative;">
              <span class="discount-badge">-${prod.descuento}%</span>
              <img src="${imgPath}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
            </div>
            <div class="card-content">
              <h3 class="card-title">${prod.nombre}</h3>
              ${prod.descripcion ? `<p class="card-description">${prod.descripcion}</p>` : ''}
              <div class="price-container">
                <span class="price-original">${prod.precioOriginal.toFixed(2)}€</span>
                <span class="price-discount">${prod.precioRebajado.toFixed(2)}€</span>
              </div>
              <a href="https://wa.me/34600000000?text=Hola,%20quiero%20pedir%20el%20producto:%20${encodeURIComponent(prod.nombre)}%20-%20${prod.precioRebajado}€" 
                 class="btn-wsp" target="_blank">
                📱 Pedir por WhatsApp
              </a>
            </div>
          `;

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
