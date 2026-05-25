'use strict';

/* casting-api.js
 * Casting modülüne özel API istemcisi.
 * api.js'den sonra yüklenir; Auth ve apiFetch fonksiyonlarını miras alır.
 */

const CAST_BASE = (typeof API_BASE !== 'undefined' ? API_BASE : 'http://localhost:4000/api') + '/casting';

/* ── Görsel URL yardımcıları ─────────────────────────────── */
const UPLOADS_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4000'
  : '') + '/uploads/casting';

function castImageUrl(fileName) {
  if (!fileName) return null;
  return `${UPLOADS_BASE}/${fileName}`;
}
function castThumbUrl(thumbName) {
  if (!thumbName) return null;
  return `${UPLOADS_BASE}/thumbs/${thumbName}`;
}

/* ── JSON fetch (Auth header otomatik eklenir) ───────────── */
async function castFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = (typeof Auth !== 'undefined') ? Auth.getToken() : localStorage.getItem('ftv_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(CAST_BASE + path, { ...options, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/* ── Multipart fetch (dosya upload — Content-Type YAZILMAZ) ─ */
async function castMultipartFetch(path, formData) {
  const headers = {};
  const token = (typeof Auth !== 'undefined') ? Auth.getToken() : localStorage.getItem('ftv_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(CAST_BASE + path, { method: 'POST', headers, body: formData });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════ */

const CastingAPI = {

  /* Şehir listesi */
  getCities: () => castFetch('/cities'),

  /* İlan listesi — filtreler URLSearchParams ile */
  getListings(filters = {}) {
    const params = new URLSearchParams();
    const allowed = [
      'category','city_id','gender','experience',
      'min_age','max_age','min_height','max_height',
      'min_weight','max_weight','eye_color','hair_color',
      'shoe_size','body_size','featured_only','has_photos',
      'page','limit',
    ];
    allowed.forEach(k => {
      if (filters[k] !== undefined && filters[k] !== '' && filters[k] !== null) {
        params.set(k, filters[k]);
      }
    });
    return castFetch('/listings?' + params.toString());
  },

  /* İlan detayı (slug veya id) */
  getListing: (slugOrId) => castFetch(`/listings/${encodeURIComponent(slugOrId)}`),

  /* Kendi ilanlarım (auth gerekli) */
  getMyListings: () => castFetch('/my-listings'),

  /* Yeni ilan başvurusu — FormData ile */
  createListing: (formData) => castMultipartFetch('/listings', formData),

  /* Çalışma talebi */
  createInquiry: (body) => castFetch('/inquiries', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};

/* ═══════════════════════════════════════════════════════════
   UI YARDIMCILARI (casting'e özel)
   ═══════════════════════════════════════════════════════════ */

/* Kategori etiketi */
function catLabel(cat) {
  const map = {
    model: 'Model', manken: 'Manken', oyuncu: 'Oyuncu',
    ic_giyim: 'İç Giyim', spor_giyim: 'Spor Giyim',
    abiye_gelinlik: 'Abiye & Gelinlik',
  };
  return map[cat] || cat;
}

/* Cinsiyet etiketi */
function genderLabel(g) {
  const map = { erkek: 'Erkek', kadin: 'Kadın', diger: 'Diğer' };
  return map[g] || g;
}

/* Deneyim etiketi */
function expLabel(e) {
  const map = {
    yeni_baslayan: 'Yeni Başlayan',
    deneyimli:     'Deneyimli',
    profesyonel:   'Profesyonel',
  };
  return map[e] || e;
}

/* İlan kartı HTML üretici */
function buildCardHTML(listing) {
  const img   = listing.images?.find(i => i.type === 'PROFILE');
  const thumb = img?.thumb ? castThumbUrl(img.thumb) : null;
  const main  = img ? castImageUrl(img.file_name) : null;
  const imgSrc = thumb || main;

  const photoHTML = imgSrc
    ? `<img src="${imgSrc}" alt="${escHtml(listing.full_name)}" loading="lazy">`
    : `<div class="c-card__photo-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
        </svg>
        <span>Fotoğraf yok</span>
       </div>`;

  const featuredMark = listing.is_featured
    ? `<span class="c-card__featured-mark" data-i18n="card.featured">Öne Çıkan</span>` : '';

  return `
    <a class="c-card" href="ilan?slug=${encodeURIComponent(listing.slug || listing.id)}">
      <div class="c-card__photo c-card__img">
        ${photoHTML}
        ${featuredMark}
      </div>
      <div class="c-card__body">
        <div class="c-card__top">
          <div class="c-card__name">${escHtml(listing.full_name)}</div>
          <span class="c-badge c-badge--cat">${catLabel(listing.category)}</span>
        </div>
        <div class="c-card__stats">
          <span class="c-card__stat"><strong>${listing.age}</strong> yaş</span>
          <span class="c-card__stat-sep">·</span>
          <span class="c-card__stat"><strong>${listing.height}</strong> cm</span>
          <span class="c-card__stat-sep">·</span>
          <span class="c-card__stat"><strong>${listing.weight}</strong> kg</span>
        </div>
        <div class="c-card__city">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8 14s-5-4.686-5-8a5 5 0 0110 0c0 3.314-5 8-5 8z"/>
            <circle cx="8" cy="6" r="1.5"/>
          </svg>
          ${escHtml(listing.city_name)}
        </div>
        <div class="c-card__footer">
          <span class="c-card__exp">${expLabel(listing.experience)}</span>
          <span class="c-badge c-badge--gold">${genderLabel(listing.gender)}</span>
        </div>
      </div>
    </a>`;
}

/* XSS koruması */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Sayfa bildirimi */
function castAlert(elId, msg, type = 'error') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = `c-alert c-alert--${type} visible`;
  el.textContent = msg;
  if (type === 'success') setTimeout(() => el.classList.remove('visible'), 5000);
}

/* Loading durumu — iki argüman: elemID, bool */
function castLoading(containerId, show) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (show) {
    el.innerHTML = `<div class="c-loading"><div class="c-spinner"></div><span>Yükleniyor…</span></div>`;
  }
}

/* Auth durumuna göre nav butonunu güncelle */
function updateCastingNav() {
  const loginBtn = document.getElementById('c-nav-login');
  if (!loginBtn) return;
  const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
  if (user) {
    loginBtn.textContent = user.first_name;
    loginBtn.href = '../hesabim';
  }
}

/* Scroll reveal */
function initScrollReveal() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* Burger / mobile menu */
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobile-menu');
  const close  = document.getElementById('mobile-menu-close');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => menu.classList.add('open'));
  close?.addEventListener('click', () => menu.classList.remove('open'));
}

/* Header scroll efekti */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(10,10,10,.96)';
      header.style.borderBottom = '1px solid rgba(255,255,255,.08)';
    } else {
      header.style.background = 'rgba(10,10,10,.92)';
      header.style.borderBottom = '1px solid rgba(255,255,255,.08)';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
