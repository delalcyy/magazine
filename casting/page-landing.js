'use strict';

(async function init() {
  initHeaderScroll();
  initMobileMenu();
  updateCastingNav();
  initScrollReveal();
  await loadFeaturedListings();
  await loadStats();
})();

async function loadFeaturedListings() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  const { ok, data } = await CastingAPI.getListings({ featured_only: 'true', limit: 6 });

  if (!ok || !data.listings?.length) {
    /* Öne çıkan ilan yoksa tüm ilanlardan göster */
    const fallback = await CastingAPI.getListings({ limit: 6 });
    if (!fallback.ok || !fallback.data.listings?.length) {
      grid.innerHTML = `<div class="c-empty">
        <div class="c-empty__icon">◇</div>
        <p class="c-empty__title">Henüz ilan yok</p>
        <p class="c-empty__sub">Yakında yeni ilanlar yayınlanacak.</p>
      </div>`;
      return;
    }
    renderGrid(grid, fallback.data.listings);
    return;
  }

  renderGrid(grid, data.listings);
}

function renderGrid(container, listings) {
  container.innerHTML = `<div class="c-grid">${listings.map(buildCardHTML).join('')}</div>`;
}

async function loadStats() {
  /* Sabit gösterim — ilerleyen dönemde gerçek sayıya bağlanacak */
}
