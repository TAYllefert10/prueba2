// ====== CAMBIO DE COLOR DE IMAGEN ======
function changeColor(imgId, newSrc) {
  const el = document.getElementById(imgId);
  if (!el) return;
  el.src = "images/" + newSrc;
}

// ====== MENÚ DESPLEGABLE ======
function toggleDropdown(menuId, btnEl) {
  document.querySelectorAll('.dropdown').forEach(dd => {
    const content = dd.querySelector('.dropdown-content');
    const btn = dd.querySelector('.dropbtn');
    if (content && content.id !== menuId) {
      dd.classList.remove('open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  const parent = btnEl.closest('.dropdown');
  const content = document.getElementById(menuId);
  if (!parent || !content) return;

  const isOpen = parent.classList.toggle('open');
  btnEl.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown').forEach(dd => {
      dd.classList.remove('open');
      const btn = dd.querySelector('.dropbtn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown-content a').forEach(a => {
    a.addEventListener('click', () => {
      document.querySelectorAll('.dropdown').forEach(dd => dd.classList.remove('open'));
      document.querySelectorAll('.dropbtn').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    });
  });
});

// ====== BUSCADOR + FILTROS ======
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const pills = document.querySelectorAll('.pill');
  const cards = Array.from(document.querySelectorAll('.card'));

  let currentGender = 'all';
  let currentCategory = 'all';
  let currentQuery = '';

  function normalize(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function filterCards() {
    const q = normalize(currentQuery);
    cards.forEach(card => {
      const gender = normalize(card.dataset.gender);
      const category = normalize(card.dataset.category);
      const name = normalize(card.dataset.name);
      const genderOk = currentGender === 'all' || gender === currentGender;
      const categoryOk = currentCategory === 'all' || category === category;
      const searchOk = q === '' || name.includes(q) || gender.includes(q) || category.includes(q);
      
      card.style.display = (genderOk && categoryOk && searchOk) ? 'block' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      currentQuery = e.target.value;
      filterCards();
    });
  }

  pills.forEach(p => {
    p.addEventListener('click', () => {
      const type = p.dataset.filterType;
      const value = normalize(p.dataset.filterValue);
      
      document.querySelectorAll(`.pill[data-filter-type="${type}"]`).forEach(b => b.classList.remove('active'));
      p.classList.add('active');
      
      if (type === 'gender') currentGender = value;
      if (type === 'category') currentCategory = value;
      
      filterCards();
    });
  });

  // Iniciar
  filterCards();
});

// ====== SCROLL REVEAL ======
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.revealable');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('reveal'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
});

// ====== BOTÓN SUBIR ======
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnTop');
  if (!btn) return;
  
  const onScroll = () => { btn.style.display = (window.scrollY > 400) ? 'block' : 'none'; };
  window.addEventListener('scroll', onScroll);
  onScroll();
  
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

// ====== PARTICULAS ======
document.addEventListener('DOMContentLoaded', () => {
  if (typeof particlesJS === 'undefined') return;
  
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
});

// ====== RIBBONS DE DESCUENTO ======
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card').forEach(card => {
    const priceDel = card.querySelector('.price del');
    const priceIns = card.querySelector('.price ins');
    let ribbon = card.querySelector('.ribbon');
    
    if (!ribbon) {
      ribbon = document.createElement('span');
      ribbon.className = 'ribbon';
      card.insertBefore(ribbon, card.firstChild);
    }
    
    if (!priceDel || !priceIns) return;
    
    const original = parseFloat(priceDel.textContent.replace(/[€,]/g,'').trim());
    const discounted = parseFloat(priceIns.textContent.replace(/[€,]/g,'').trim());
    
    if (isNaN(original) || isNaN(discounted) || original <= discounted) {
      ribbon.style.display = 'none';
    } else {
      const percent = Math.round(((original - discounted)/original)*100);
      ribbon.textContent = `-${percent}%`;
      ribbon.style.display = 'inline-block';
    }
  });
});
