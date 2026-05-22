/**
 * server.js — FashionTV Magazine Backend
 * ─────────────────────────────────────────────────────
 * Başlatmak için:
 *   node server.js          (production)
 *   npx nodemon server.js   (geliştirme — otomatik yeniden başlatma)
 */

'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const { initDb } = require('./database/db');
const fs         = require('fs');

/* ── Uygulama ── */
const app  = express();
const PORT = process.env.PORT || 4000;

/* ── Veritabanını başlat (tablolar yoksa oluştur) ── */
initDb();

/* ════════════════════════════════════════════════════
   MIDDLEWARE
════════════════════════════════════════════════════ */

/* CORS — hangi origin'den istek geleceğini belirt */
app.use(cors({
  origin: true,
  credentials: true
}));

app.options('*', cors());

/* JSON gövdesi — 1MB limit */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/* İstek loglama (geliştirme) */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/* ════════════════════════════════════════════════════
   STATİK DOSYALAR
════════════════════════════════════════════════════ */

/* Upload edilen görseller — casting/xxx.jpg ve casting/thumbs/xxx_thumb.jpg */
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(path.join(uploadsDir, 'casting', 'thumbs'), { recursive: true });
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }));

/* Frontend HTML dosyaları */
const frontendDir = path.join(__dirname, '..');
app.use(express.static(frontendDir, { extensions: ['html'] }));

/* ════════════════════════════════════════════════════
   ROTALAR
════════════════════════════════════════════════════ */

/* Auth + user rotaları → /api/auth/... ve /api/user/... */
app.use('/api', require('./routes/auth.routes'));

/* Casting public → /api/casting/... */
app.use('/api/casting', require('./routes/casting.public.routes'));

/* Casting admin → /api/admin/casting/... */
app.use('/api/admin/casting', require('./routes/casting.admin.routes'));

/* Sağlık kontrolü */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* Bilinmeyen rota */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Rota bulunamadı.' });
});

/* Genel hata yakalayıcı */
app.use((err, _req, res, _next) => {
  console.error('[global error]', err);
  res.status(500).json({ success: false, message: 'Beklenmeyen bir hata oluştu.' });
});

/* ════════════════════════════════════════════════════
   SUNUCUYU BAŞLAT
════════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────┐');
  console.log(`  │  FashionTV Backend çalışıyor            │`);
  console.log(`  │  http://localhost:${PORT}                   │`);
  console.log('  └─────────────────────────────────────────┘');
  console.log('');
  console.log('  Endpointler:');
  console.log(`  POST  http://localhost:${PORT}/api/auth/register`);
  console.log(`  POST  http://localhost:${PORT}/api/auth/login`);
  console.log(`  GET   http://localhost:${PORT}/api/user/me`);
  console.log('');
});
