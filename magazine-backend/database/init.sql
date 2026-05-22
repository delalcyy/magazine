-- ══════════════════════════════════════════════════════
--  FashionTV Magazine — Veritabanı Şeması
--  Çalıştır: node database/db.js --init
-- ══════════════════════════════════════════════════════

-- Kullanıcılar
CREATE TABLE IF NOT EXISTS users (
  id            TEXT    PRIMARY KEY,          -- UUID v4
  first_name    TEXT    NOT NULL,
  last_name     TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,      -- küçük harfle saklanır
  password_hash TEXT    NOT NULL,             -- bcrypt (12 round)
  role          TEXT    NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'admin')),
  is_active                   INTEGER NOT NULL DEFAULT 1,
  kvkk_accepted               INTEGER NOT NULL DEFAULT 0,
  email_verified              INTEGER NOT NULL DEFAULT 0,
  verification_token          TEXT,
  verification_token_expires  TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- E-posta üzerine index (hızlı arama)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
