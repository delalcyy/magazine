'use strict';

const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto   = require('crypto');
const { getDb } = require('../database/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/mail.service');

/* ── Yardımcılar ── */
function signToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function tokenExpiry() {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d.toISOString();
}

/* ════════════════════════════════════════════════════
   KAYIT OL
   POST /api/auth/register
════════════════════════════════════════════════════ */
async function register(req, res) {
  try {
    const { first_name, last_name, email, password, password_confirm, kvkk_accepted } = req.body;

    if (!first_name || !last_name || !email || !password || !password_confirm) {
      return res.status(400).json({ success: false, message: 'Tüm alanları eksiksiz doldurunuz.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Geçerli bir e-posta adresi giriniz.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalıdır.' });
    }
    if (password !== password_confirm) {
      return res.status(400).json({ success: false, message: 'Şifreler birbiriyle eşleşmiyor.' });
    }
    if (!kvkk_accepted) {
      return res.status(400).json({ success: false, message: 'Kullanım koşullarını ve gizlilik politikasını kabul etmelisiniz.' });
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const id    = uuidv4();
    const token = generateVerificationToken();
    const expires = tokenExpiry();

    db.prepare(`
      INSERT INTO users
        (id, first_name, last_name, email, password_hash, kvkk_accepted,
         email_verified, verification_token, verification_token_expires)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, first_name.trim(), last_name.trim(), normalizedEmail, password_hash, kvkk_accepted ? 1 : 0, token, expires);

    /* Mail gönder — hata olursa kaydı geri al değil, kullanıcıya bildir */
    try {
      await sendVerificationEmail(normalizedEmail, first_name.trim(), token);
    } catch (mailErr) {
      console.error('[register] mail gönderilemedi:', mailErr.message);
      return res.status(201).json({
        success: true,
        needsVerification: true,
        mailError: true,
        message: 'Hesabınız oluşturuldu ancak doğrulama maili gönderilemedi. Lütfen destek ekibiyle iletişime geçin.'
      });
    }

    return res.status(201).json({
      success: true,
      needsVerification: true,
      message: `Hesabınız oluşturuldu! ${normalizedEmail} adresine doğrulama linki gönderdik. Lütfen e-postanızı kontrol edin.`
    });

  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.' });
  }
}

/* ════════════════════════════════════════════════════
   E-POSTA DOĞRULA
   GET /api/auth/verify-email?token=xxx
════════════════════════════════════════════════════ */
function verifyEmail(req, res) {
  const { token } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || '';

  if (!token) {
    return res.redirect(`${frontendUrl}/eposta-dogrula?error=missing`);
  }

  const db = getDb();
  const user = db.prepare(
    'SELECT id, email_verified, verification_token_expires FROM users WHERE verification_token = ?'
  ).get(token);

  if (!user) {
    return res.redirect(`${frontendUrl}/eposta-dogrula?error=invalid`);
  }

  if (user.email_verified) {
    return res.redirect(`${frontendUrl}/eposta-dogrula?status=already`);
  }

  if (new Date(user.verification_token_expires) < new Date()) {
    return res.redirect(`${frontendUrl}/eposta-dogrula?error=expired`);
  }

  db.prepare(`
    UPDATE users
    SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL, updated_at = datetime('now')
    WHERE id = ?
  `).run(user.id);

  return res.redirect(`${frontendUrl}/eposta-dogrula?status=success`);
}

/* ════════════════════════════════════════════════════
   DOĞRULAMA MAİLİ TEKRAR GÖNDER
   POST /api/auth/resend-verification
════════════════════════════════════════════════════ */
async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'E-posta adresi gereklidir.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());

    /* Güvenlik: hesap yoksa da aynı mesajı dön (kullanıcı numaralama önlemi) */
    if (!user || user.email_verified) {
      return res.json({ success: true, message: 'Eğer bu e-posta doğrulanmamış bir hesaba aitse, yeni bir link gönderdik.' });
    }

    const token   = generateVerificationToken();
    const expires = tokenExpiry();

    db.prepare(`
      UPDATE users SET verification_token = ?, verification_token_expires = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(token, expires, user.id);

    await sendVerificationEmail(user.email, user.first_name, token);

    return res.json({ success: true, message: 'Eğer bu e-posta doğrulanmamış bir hesaba aitse, yeni bir link gönderdik.' });

  } catch (err) {
    console.error('[resendVerification]', err);
    return res.status(500).json({ success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.' });
  }
}

/* ════════════════════════════════════════════════════
   GİRİŞ YAP
   POST /api/auth/login
════════════════════════════════════════════════════ */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'E-posta ve şifre alanları boş bırakılamaz.' });
    }

    const db   = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'E-posta adresi veya şifre hatalı.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Hesabınız askıya alınmış. Destek ekibiyle iletişime geçiniz.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'E-posta adresi veya şifre hatalı.' });
    }

    /* E-posta doğrulanmamış */
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.'
      });
    }

    const token = signToken(user.id, user.role);

    return res.json({
      success: true,
      message: 'Giriş başarılı. Hoş geldiniz!',
      token,
      user: {
        id:         user.id,
        first_name: user.first_name,
        last_name:  user.last_name,
        email:      user.email,
        role:       user.role
      }
    });

  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.' });
  }
}

/* ════════════════════════════════════════════════════
   KENDİ BİLGİLERİM
   GET /api/user/me   (authMiddleware sonrası çalışır)
════════════════════════════════════════════════════ */
function me(req, res) {
  const db   = getDb();
  const user = db.prepare(
    'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?'
  ).get(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
  }

  return res.json({ success: true, user });
}

/* ════════════════════════════════════════════════════
   ŞİFREMİ UNUTTUM
   POST /api/auth/forgot-password
════════════════════════════════════════════════════ */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'E-posta adresi gereklidir.' });
    }

    const db   = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());

    /* Güvenlik: kullanıcı yoksa da aynı mesajı dön */
    if (!user) {
      return res.json({ success: true, message: 'E-posta adresiniz sistemde kayıtlıysa şifre sıfırlama linki gönderdik.' });
    }

    const token   = generateVerificationToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 saat

    db.prepare(`
      UPDATE users SET password_reset_token = ?, password_reset_expires = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(token, expires, user.id);

    await sendPasswordResetEmail(user.email, user.first_name, token);

    return res.json({ success: true, message: 'E-posta adresiniz sistemde kayıtlıysa şifre sıfırlama linki gönderdik.' });

  } catch (err) {
    console.error('[forgotPassword]', err);
    return res.status(500).json({ success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.' });
  }
}

/* ════════════════════════════════════════════════════
   ŞİFRE SIFIRLA
   POST /api/auth/reset-password
════════════════════════════════════════════════════ */
async function resetPassword(req, res) {
  try {
    const { token, password, password_confirm } = req.body;

    if (!token || !password || !password_confirm) {
      return res.status(400).json({ success: false, message: 'Tüm alanları doldurunuz.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalıdır.' });
    }
    if (password !== password_confirm) {
      return res.status(400).json({ success: false, message: 'Şifreler birbiriyle eşleşmiyor.' });
    }

    const db   = getDb();
    const user = db.prepare('SELECT * FROM users WHERE password_reset_token = ?').get(token);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş link.' });
    }
    if (new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Bu linkin süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    db.prepare(`
      UPDATE users
      SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL, updated_at = datetime('now')
      WHERE id = ?
    `).run(password_hash, user.id);

    return res.json({ success: true, message: 'Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.' });

  } catch (err) {
    console.error('[resetPassword]', err);
    return res.status(500).json({ success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.' });
  }
}

module.exports = { register, login, me, verifyEmail, resendVerification, forgotPassword, resetPassword };
