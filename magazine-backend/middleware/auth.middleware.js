/**
 * middleware/auth.middleware.js
 * ─────────────────────────────────────────────────────
 * Korumalı route'larda kullanılır.
 * Authorization: Bearer <token>  header'ını doğrular,
 * req.user alanını doldurur.
 */

'use strict';

const jwt    = require('jsonwebtoken');
const { getDb } = require('../database/db');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  /* Header yoksa veya format yanlışsa */
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Yetkilendirme başlığı eksik veya hatalı.'
    });
  }

  const token = authHeader.slice(7); // "Bearer " (7 karakter) sonrasını al

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* Token geçerli ama kullanıcı silinmiş / deaktif olabilir */
    const db = getDb();
    const user = db
      .prepare('SELECT id, email, role, is_active FROM users WHERE id = ?')
      .get(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı veya hesap deaktif.'
      });
    }

    req.user = user; // sonraki handler'lara aktar
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Oturum süreniz doldu. Lütfen tekrar giriş yapınız.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token.'
    });
  }
}

module.exports = authMiddleware;
