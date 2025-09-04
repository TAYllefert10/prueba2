// ====== ESPERAR A QUE EL DOM ESTÉ LISTO ======
document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('product-grid');
  const pagination = document.getElementById('pagination');

  let productos = [];
  let currentPage = 1;
  const itemsPerPage = 6;
  let currentFilters = { gender: 'all', category: 'all', search: '' };

  // ====== CARGAR PRODUCTOS DESDE JSON ======
  fetch('productos.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('No se encontró productos.json o está vacío');
      }
      return response.json();
    })
    .then(data => {
      productos = data;
      console.log('✅ Productos cargados:', productos);
      renderProducts(1);
    })
    .catch(error => {
      console.error('❌ Error al cargar productos:', error);
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #ff3333; padding: 2rem; font-size: 1.1rem;">
          ❌ Error: No se pudieron cargar los productos.<br>
          <small>${error.message}</small><br><br>
          Asegúrate de que <strong>productos.json</strong> exista en la raíz y tenga formato correcto.
        </div>
      `;
    });

  // ====== RENDERIZAR PRODUCTOS ======
  function renderProducts(page = 1) {
    if (!productos || productos.length === 0) return;

    const filtered = productos.filter(p => {
      const matchesGender = currentFilters.gender === 'all' || p.genero === currentFilters.gender;
      const matchesCategory = currentFilters.category === 'all' || p.categoria === currentFilters.category;
      const matchesSearch = !currentFilters.search || 
        p.nombre.toLowerCase().includes(currentFilters.search.toLowerCase());
      return matchesGender && matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    currentPage = page > totalPages ? totalPages : page;

    grid.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const toShow = filtered.slice(start, start + itemsPerPage);

    toShow.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card revealable';
      card.dataset.id = prod.id;
      card.dataset.gender = prod.genero;
      card.dataset.category = prod.categoria;
      card.dataset.name = prod.nombre;

      let colorOptions = '';
      (prod.colores || ['black']).forEach(color => {
        const imgName = prod.img.replace(/_[^_]+\.webp/, `_${color}.webp`);
        colorOptions += `
          <span 
            class="color-circle" 
            style="background:${getColorHex(color)}" 
            onclick="changeColor('img-${prod.id}', '${imgName}')" 
            title="${color}">
          </span>`;
      });

      const discount = Math.round((1 - prod.precio / prod.precioAnt) * 100);

      card.innerHTML = `
        <span class="ribbon">-${discount}%</span>
        <img id="img-${prod.id}" src="images/${prod.img}" alt="${prod.nombre}">
        <div class="card-info">
          <h3>${prod.nombre}</h3>
          <p class="price"><del>${prod.precioAnt}€</del> <ins>${prod.precio}€</ins></p>
          <label for="size-${prod.id}" class="label-inline">Talla:</label>
          <select id="size-${prod.id}">
            <option>S</option><option>M</option><option>L</option><option>XL</option><option>2XL</option>
          </select>
          <div class="color-options">${colorOptions}</div>
        </div>
      `;
      grid.appendChild(card);
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = i === currentPage ? 'active' : '';
      btn.addEventListener('click', () => renderProducts(i));
      pagination.appendChild(btn);
    }
  }

  // ====== FUNCIONES AUXILIARES ======
  function getColorHex(color) {
    const colors = {
      black: '#000', white: '#fff', gray: '#808080', darkgray: '#2F2F2F', lightgray: '#D3D3D3',
      blue: '#0000ff', darkblue: '#00008B', navy: '#000080', lightblue: '#ADD8E6',
      green: '#008000', darkgreen: '#006400', brown: '#A52A2A', burgundy: '#800000',
      red: '#ff0000', purple: '#800080', pink: '#FFC0CB', cream: '#F5F5DC', apricot: '#FBCEB1'
    };
    return colors[color] || '#000';
  }

  window.changeColor = function(imgId, newSrc) {
    const el = document.getElementById(imgId);
    if (!el) return;
    el.src = "images/" + newSrc;
  };

  // ====== FILTROS ======
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      currentFilters.search = e.target.value;
      currentPage = 1;
      renderProducts(1);
    });
  }

  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filterType || btn.dataset.filter;
      const value = btn.dataset.filterValue || btn.dataset.value;
      
      document.querySelectorAll(`.pill[data-filter-type="${filter}"], .pill[data-filter="${filter}"]`)
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentFilters[filter] = value;
      currentPage = 1;
      renderProducts(1);
    });
  });

  // ====== MENÚ DESPLEGABLE ======
  window.toggleDropdown = function(menuId, btnEl) {
    document.querySelectorAll('.dropdown').forEach(dd => {
      const content = dd.querySelector('.dropdown-content');
      if (content && content.id !== menuId) {
        dd.classList.remove('open');
      }
    });

    const parent = btnEl.closest('.dropdown');
    parent.classList.toggle('open');
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown').forEach(dd => dd.classList.remove('open'));
    }
  });

  // ====== PARTICULAS ======
  if (typeof particlesJS !== 'undefined') {
    particlesJS("particles-js", {
      "particles": {
        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.45 },
        "size": { "value": 3, "random": true },
        "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.25, "width": 1 },
        "move": { "enable": true, "speed": 2.4, "direction": "none", "straight": false, "out_mode": "out" }
      },
      "interactivity": {
        "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" } },
        "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 3 } }
      },
      "retina_detect": true
    });
  }

  // ====== SCROLL REVEAL ======
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('reveal'));
  }, { threshold: 0.1 });
  document.querySelectorAll('.revealable').forEach(el => observer.observe(el));

  // ====== BOTÓN SUBIR ======
  const btnTop = document.getElementById('btnTop');
  window.addEventListener('scroll', () => {
    btnTop.style.display = window.scrollY > 400 ? 'block' : 'none';
  });
  btnTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
