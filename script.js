document.addEventListener("DOMContentLoaded", async () => {
  // Partículas
  if (typeof tsParticles !== "undefined") {
    tsParticles.load("tsparticles", {
      particles: {
        number: { value: 80, density: { enable: true, area: 800 } },
        color: { value: "#e63946" },
        shape: { type: "circle" },
        opacity: { value: 0.7, random: true },
        size: { value: 3, random: true },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: true,
          straight: false,
          outModes: "out"
        }
      },
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } }
      },
      background: { color: "#000" }
    });
  }

  const catalogo = document.getElementById("catalogo");

  try {
    const response = await fetch("productos.json");
    const productos = await response.json();

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
          const imgId = `img-${producto.nombre.replace(/\s+/g, '-').toLowerCase()}`;

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
              <img id="${imgId}" src="${imgPath}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
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
              
              option.parentNode.querySelectorAll(".color-option").forEach(el => {
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
        <p style="color: #e63946; font-size: 1.2rem; text-align: center; padding: 1rem;">
          ⚠️ Error al cargar productos: ${error.message}
        </p>
      </div>
    `;
  }
});
