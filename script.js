document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");
  const generoFilter = document.getElementById("genero-filter");
  const categoriaFilter = document.getElementById("categoria-filter");
  const clearFilters = document.getElementById("clear-filters");

  // Modal
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeModal = document.getElementById("closeModal");
  const prevBtn = document.getElementById("nextColor");
  const nextBtn = document.getElementById("prevColor");
  const colorIndicators = document.getElementById("colorIndicators");

  let productos = [];
  let categoriasUnicas = new Set();
  let currentProduct = null;
  let currentIndex = 0;

  try {
    const response = await fetch("productos.json");
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    productos = await response.json();

    // Extraer categorías
    productos.forEach(p => categoriasUnicas.add(p.categoria));
    const categoriasOrdenadas = [...categoriasUnicas].sort();

    categoriasOrdenadas.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoriaFilter.appendChild(option);
    });

    // Función para renderizar productos
    function renderizarProductos(filtroGenero = "", filtroCategoria = "") {
      catalogo.innerHTML = "";

      const productosFiltrados = productos.filter(p => {
        const coincideGenero = !filtroGenero || p.genero === filtroGenero;
        const coincideCategoria = !filtroCategoria || p.categoria === filtroCategoria;
        return coincideGenero && coincideCategoria;
      });

      if (productosFiltrados.length === 0) {
        const div = document.createElement("div");
        div.className = "seccion";
        div.innerHTML = `<p style="color: #aaa; text-align: center; padding: 2rem;">No hay productos que coincidan.</p>`;
        catalogo.appendChild(div);
        return;
      }

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
                  data-index="${index}"
                  title="${color.nombre}"
                ></div>
              `;
            }).join("");

            // Mostrar tallas o medidas
            const sizeText = producto.tallas ? `Tallas: ${producto.tallas}` : 
                           producto.medidas ? `Medidas: ${producto.medidas}` : "";

            card.innerHTML = `
              <div class="img-container">
                <span class="discount-badge">-${descuento}%</span>
                <img id="${imgId}" src="${imgPath}" alt="${producto.nombre}" class="main-image" onerror="this.src='https://picsum.photos/300/300'">
              </div>
              <div class="card-content">
                <h3 class="card-title">${producto.nombre}</h3>
                ${sizeText ? `<p class="size-info">${sizeText}</p>` : ''}
                <div class="color-selector">${colorOptions}</div>
                <div class="price-container">
                  <span class="price-original">${producto.precioOriginal.toFixed(2)}€</span>
                  <span class="price-discount">${producto.precioRebajado.toFixed(2)}€</span>
                </div>
              </div>
            `;

            // ✅ Declarar mainImg DESPUÉS de innerHTML
            const mainImg = card.querySelector(`#${imgId}`);

            // === CONTROL DE STOCK ===
            if (!producto.disponible) {
              card.classList.add("out-of-stock");
              // No añadir eventos si está agotado
            } else {
              // Solo si está disponible, añadir eventos
              mainImg.parentElement.addEventListener("click", () => {
                openModal(producto, 0);
              });

              card.querySelectorAll(".color-option").forEach(option => {
                option.addEventListener("click", () => {
                  const newImg = option.getAttribute("data-img");
                  const index = parseInt(option.getAttribute("data-index"));
                  mainImg.src = `https://tayllefert10.github.io/prueba/images/${newImg}`;
                  option.parentNode.querySelectorAll(".color-option").forEach(el => el.classList.remove("active"));
                  option.classList.add("active");
                });
              });
            }

            grid.appendChild(card);
          });

          categoriaDiv.appendChild(grid);
          seccionDiv.appendChild(categoriaDiv);
        }

        catalogo.appendChild(seccionDiv);
      }
    }

    // Generar ID seguro
    function generarId(nombre) {
      return "img-" + nombre
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    // === MODAL ===
    function openModal(producto, index) {
      currentProduct = producto;
      currentIndex = index;
      modalImg.src = `https://tayllefert10.github.io/prueba/images/${producto.colores[index].imagen}`;
      modal.style.display = "block";
      updateIndicators();
    }

    function closeModalFn() {
      modal.style.display = "none";
      currentProduct = null;
    }

    function nextImage() {
      if (currentProduct && currentProduct.colores.length > 1) {
        currentIndex = (currentIndex + 1) % currentProduct.colores.length;
        modalImg.src = `https://tayllefert10.github.io/prueba/images/${currentProduct.colores[currentIndex].imagen}`;
        updateIndicators();
      }
    }

    function prevImage() {
      if (currentProduct && currentProduct.colores.length > 1) {
        currentIndex = (currentIndex - 1 + currentProduct.colores.length) % currentProduct.colores.length;
        modalImg.src = `https://tayllefert10.github.io/prueba/images/${currentProduct.colores[currentIndex].imagen}`;
        updateIndicators();
      }
    }

    function updateIndicators() {
      colorIndicators.innerHTML = "";
      currentProduct.colores.forEach((color, index) => {
        const indicator = document.createElement("div");
        indicator.className = `indicator ${index === currentIndex ? 'active' : 'inactive'}`;
        indicator.addEventListener("click", () => {
          currentIndex = index;
          modalImg.src = `https://tayllefert10.github.io/prueba/images/${color.imagen}`;
          updateIndicators();
        });
        colorIndicators.appendChild(indicator);
      });
    }

    // Eventos del modal
    closeModal.addEventListener("click", closeModalFn);
    prevBtn.addEventListener("click", prevImage);
    nextBtn.addEventListener("click", nextImage);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModalFn();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    });

    // Touch events
    let touchStartX = 0;
    modalImg.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modalImg.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextImage();
        else prevImage();
      }
    }, { passive: true });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModalFn();
    });

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
