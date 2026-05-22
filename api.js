/**
 * api.js — FashionTV Magazine Frontend API İstemcisi
 * ─────────────────────────────────────────────────────
 * Tüm sayfalarda <script src="api.js"> ile yüklenir.
 * Backend URL'yi tek yerden yönetir.
 *
 * KURULUM:
 *   - Backend localhost:4000 üzerinde çalışmalı
 *   - Bu dosyayı HTML'lerle aynı klasöre koy
 */

'use strict';

/* ── BACKEND ADRESI ────────────────────────────────────
   Backend farklı bir porta taşınırsa sadece bu satırı değiştir.
─────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:4000/api';

/* ══════════════════════════════════════════════════════
   TOKEN & KULLANICI YÖNETİMİ (localStorage)
══════════════════════════════════════════════════════ */
const Auth = {
  /* Token */
  getToken:    ()    => localStorage.getItem('ftv_token'),
  setToken:    (t)   => localStorage.setItem('ftv_token', t),
  removeToken: ()    => localStorage.removeItem('ftv_token'),

  /* Kullanıcı objesi */
  getUser: () => {
    try   { return JSON.parse(localStorage.getItem('ftv_user')) || null; }
    catch { return null; }
  },
  setUser:    (u) => localStorage.setItem('ftv_user', JSON.stringify(u)),
  removeUser: ()  => localStorage.removeItem('ftv_user'),

  /* Giriş durumu */
  isLoggedIn: () => !!localStorage.getItem('ftv_token'),

  /* Çıkış */
  logout: () => {
    localStorage.removeItem('ftv_token');
    localStorage.removeItem('ftv_user');
    localStorage.removeItem('ftv_selected_plan');
    window.location.href = 'index';
  }
};

/* ══════════════════════════════════════════════════════
   HTTP YARDIMCISI
══════════════════════════════════════════════════════ */
async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  /* Oturum varsa token ekle */
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(API_BASE + path, {
    ...options,
    headers
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

/* ══════════════════════════════════════════════════════
   AUTH API
══════════════════════════════════════════════════════ */
const AuthAPI = {
  /** Yeni kullanıcı kaydı */
  register: (body) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body:   JSON.stringify(body)
    }),

  /** E-posta + şifre ile giriş */
  login: (body) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body:   JSON.stringify(body)
    }),

  /** Oturum sahibinin bilgileri (token gerekli) */
  me: () => apiFetch('/user/me'),

  /** Şifre değiştir */
  changePassword: (body) =>
    apiFetch('/auth/change-password', {
      method: 'PUT',
      body:   JSON.stringify(body)
    })
};

/* ══════════════════════════════════════════════════════
   ABONELİK API  (ileride aktif olacak)
══════════════════════════════════════════════════════ */
const SubscriptionAPI = {
  getPlans:          ()     => apiFetch('/subscription/plans'),
  selectPlan:        (body) => apiFetch('/subscription/select-plan', { method:'POST', body: JSON.stringify(body) }),
  getMySubscription: ()     => apiFetch('/subscription/my-subscription')
};

/* ══════════════════════════════════════════════════════
   ÖDEME API  (ileride aktif olacak)
══════════════════════════════════════════════════════ */
const PaymentAPI = {
  createPayment: (body) => apiFetch('/payment/create',  { method:'POST', body: JSON.stringify(body) }),
  getHistory:    ()     => apiFetch('/payment/history')
};

/* ══════════════════════════════════════════════════════
   UI YARDIMCILARI
   (tüm sayfalarda doğrudan kullanılabilir)
══════════════════════════════════════════════════════ */

/**
 * Alert kutusu göster
 * @param {string} containerId  - elementin id'si
 * @param {string} message      - gösterilecek metin
 * @param {'error'|'success'|'info'} type
 */
function showAlert(containerId, message, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.className = `auth-alert ${type}`;
  el.textContent = message;
  el.style.display = 'block';
  /* Başarı mesajları 4 sn sonra otomatik kapanır */
  if (type === 'success') {
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }
}

/** Alert kutusunu gizle */
function hideAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.style.display = 'none';
}

/**
 * Buton loading durumu
 * @param {string} btnId
 * @param {boolean} loading
 * @param {string} defaultText - loading=false olduğunda geri dönen metin
 */
function setLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading ? 'Lütfen bekleyin…' : defaultText;
}

/* Tarih formatlama */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

/* Fiyat formatlama */
function formatPrice(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style:    'currency',
    currency: 'TRY'
  }).format(amount);
}
