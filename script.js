document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");

  try {
    const response = await fetch("productos.json");
    const productos = await response.json();

    productos.forEach((producto) => {
      // Calcular descuento (20% por ejemplo)
      const descuentoPorcentaje = 20;
      const precioOriginal = producto.precio;
      const precioRebajado = (precioOriginal * (1 - descuentoPorcentaje / 100)).toFixed(2);

      // Crear tarjeta
      const card = document.createElement("div");
      card.className = "card";

      // Badge de descuento
      const discountBadge = `<div class="discount-badge">-${descuentoPorcentaje}%</div>`;

      // Si está fuera de stock
      let outOfStockOverlay = "";
      let button = `<button class="btn">Añadir al carrito</button>`;
      if (producto.stock <= 0) {
        outOfStockOverlay = `<div class="out-of-stock">AGOTADO</div>`;
        button = `<button class="btn" disabled>Fuera de stock</button>`;
      }

      card.innerHTML = `
        ${producto.stock <= 0 ? outOfStockOverlay : ""}
        ${descuentoPorcentaje > 0 ? discountBadge : ""}
        <img src="${producto.imagen}" alt="${producto.nombre}" />
        <div class="card-content">
          <h3 class="card-title">${producto.nombre}</h3>
          <p class="card-description">${producto.descripcion}</p>
          <div class="price-container">
            <span class="price-original">$${precioOriginal.toFixed(2)}</span>
            <span class="price-discount">$${precioRebajado}</span>
          </div>
          ${button}
        </div>
      `;

      catalogo.appendChild(card);
    });
  } catch (error) {
    catalogo.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: red;">Error al cargar los productos: ${error.message}</p>`;
  }
});
