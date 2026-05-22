'use strict';

let currentPage = 1;
let activeFilters = {};

(function init() {
  initHeaderScroll();
  initMobileMenu();
  updateCastingNav();
  initFilters();
  readUrlParams();
  loadListings();
})();

/* URL'den kategori vs. oku */
function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) {
    activeFilters.category = params.get('category');
    document.querySelectorAll('#cat-pills .c-filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.val === params.get('category'));
    });
  }
}

/* Filtre event'leri */
function initFilters() {
  /* Kategori pills */
  document.querySelectorAll('#cat-pills .c-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#cat-pills .c-filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.category = btn.dataset.val;
      currentPage = 1; loadListings();
    });
  });

  /* Cinsiyet pills */
  document.querySelectorAll('#gender-pills .c-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#gender-pills .c-filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.gender = btn.dataset.val;
      currentPage = 1; loadListings();
    });
  });

  /* Şehir select */
  const citySelect = document.getElementById('f-city');
  CastingAPI.getCities().then(({ ok, data }) => {
    if (!ok) return;
    data.cities.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.name;
      citySelect.appendChild(opt);
    });
  });
  citySelect.addEventListener('change', () => {
    activeFilters.city_id = citySelect.value;
    currentPage = 1; loadListings();
  });

  /* Deneyim */
  document.getElementById('f-exp').addEventListener('change', e => {
    activeFilters.experience = e.target.value;
    currentPage = 1; loadListings();
  });

  /* Yaş, boy, kilo */
  ['f-age-min','f-age-max','f-h-min','f-h-max','f-w-min','f-w-max'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', debounce(() => {
      activeFilters.min_age    = document.getElementById('f-age-min')?.value || '';
      activeFilters.max_age    = document.getElementById('f-age-max')?.value || '';
      activeFilters.min_height = document.getElementById('f-h-min')?.value   || '';
      activeFilters.max_height = document.getElementById('f-h-max')?.value   || '';
      activeFilters.min_weight = document.getElementById('f-w-min')?.value   || '';
      activeFilters.max_weight = document.getElementById('f-w-max')?.value   || '';
      currentPage = 1; loadListings();
    }, 600));
  });

  /* Saç / göz */
  document.getElementById('f-hair')?.addEventListener('change', e => { activeFilters.hair_color = e.target.value; currentPage = 1; loadListings(); });
  document.getElementById('f-eye')?.addEventListener('change',  e => { activeFilters.eye_color  = e.target.value; currentPage = 1; loadListings(); });

  /* Togglelar */
  document.getElementById('f-featured')?.addEventListener('change', e => { activeFilters.featured_only = e.target.checked ? 'true' : ''; currentPage = 1; loadListings(); });
  document.getElementById('f-photos')?.addEventListener('change',   e => { activeFilters.has_photos   = e.target.checked ? 'true' : ''; currentPage = 1; loadListings(); });

  /* Filtrele butonu */
  document.getElementById('apply-filters')?.addEventListener('click', () => { currentPage = 1; loadListings(); });

  /* Temizle */
  document.getElementById('reset-filters')?.addEventListener('click', () => {
    activeFilters = {};
    document.querySelectorAll('.c-filter-pill').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.c-filter-pill[data-val=""]').forEach(b => b.classList.add('active'));
    document.querySelectorAll('select.c-filter-select').forEach(s => s.value = '');
    document.querySelectorAll('input[type=number].c-filter-input').forEach(i => i.value = '');
    document.querySelectorAll('input[type=checkbox]').forEach(i => i.checked = false);
    currentPage = 1; loadListings();
  });

  /* Mobil filtre toggle */
  document.getElementById('filter-toggle')?.addEventListener('click', () => {
    const panel = document.getElementById('filter-panel');
    const isOpen = panel.classList.toggle('open');
    document.getElementById('filter-toggle').setAttribute('aria-expanded', isOpen);
  });
}

/* Ana yükleme */
async function loadListings() {
  const grid    = document.getElementById('listings-grid');
  const info    = document.getElementById('results-info');
  const pagination = document.getElementById('pagination');

  grid.innerHTML = `<div class="c-loading"><div class="c-spinner"></div><span data-i18n="results.loading">Yükleniyor…</span></div>`;

  const filters = { ...activeFilters, page: currentPage, limit: 12 };
  const { ok, data } = await CastingAPI.getListings(filters);

  if (!ok) {
    grid.innerHTML = `<div class="c-empty"><p class="c-empty__title">Bağlantı hatası.</p></div>`;
    return;
  }

  const total = data.total || 0;
  const listings = data.listings || [];

  /* Sonuç sayısı */
  if (typeof I18n !== 'undefined') {
    info.textContent = total + ' ' + (I18n.t('stats.active') || 'ilan');
  } else {
    info.textContent = total + ' ilan';
  }

  /* Sayfa başlığı sayacı */
  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = total + ' ilan';

  if (!listings.length) {
    grid.innerHTML = `
      <div class="c-empty">
        <div class="c-empty__icon">◇</div>
        <p class="c-empty__title" data-i18n="results.empty">Uygun ilan bulunamadı.</p>
        <p class="c-empty__sub" data-i18n="results.empty.sub">Filtrelerinizi değiştirmeyi deneyin.</p>
      </div>`;
    pagination.innerHTML = '';
    if (typeof I18n !== 'undefined') I18n.applyAll();
    return;
  }

  grid.innerHTML = `<div class="c-grid">${listings.map(buildCardHTML).join('')}</div>`;

  /* Sayfalama */
  const totalPages = Math.ceil(total / 12);
  pagination.innerHTML = renderPagination(currentPage, totalPages);
  pagination.querySelectorAll('.c-page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      loadListings();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (typeof I18n !== 'undefined') I18n.applyAll();
}

function renderPagination(page, total) {
  if (total <= 1) return '';
  let html = '<div class="c-pagination">';
  for (let i = 1; i <= total; i++) {
    html += `<button class="c-page-btn${i === page ? ' active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += '</div>';
  return html;
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
