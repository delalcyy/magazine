/**
 * database/db.js
 * ─────────────────────────────────────────────────────
 * SQLite bağlantısını tek yerden yönetir (singleton).
 *
 * Veritabanını sıfırlamak / ilk kez oluşturmak için:
 *   node database/db.js --init
 */

'use strict';

const path     = require('path');
const fs       = require('fs');
const Database = require('better-sqlite3');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './database/fashiontv.sqlite';

let _db = null;

/**
 * Bağlantıyı döner; ilk çağrıda oluşturur.
 */
function getDb() {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');  // eşzamanlı okuma performansı
  _db.pragma('foreign_keys = ON');

  return _db;
}

/**
 * Tabloları oluşturur (ilk çalıştırma).
 * `node database/db.js --init` ile tetiklenir.
 */
function initDb() {
  const db = getDb();

  const schemas = ['init.sql', 'casting.sql'];
  for (const file of schemas) {
    const sqlPath = path.join(__dirname, file);
    if (fs.existsSync(sqlPath)) {
      db.exec(fs.readFileSync(sqlPath, 'utf8'));
    }
  }

  /* Migration: e-posta doğrulama sütunları (mevcut DB için) */
  const cols = db.prepare("PRAGMA table_info(users)").all().map(r => r.name);
  if (!cols.includes('email_verified')) {
    db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0");
  }
  if (!cols.includes('verification_token')) {
    db.exec("ALTER TABLE users ADD COLUMN verification_token TEXT");
  }
  if (!cols.includes('verification_token_expires')) {
    db.exec("ALTER TABLE users ADD COLUMN verification_token_expires TEXT");
  }
  if (!cols.includes('password_reset_token')) {
    db.exec("ALTER TABLE users ADD COLUMN password_reset_token TEXT");
  }
  if (!cols.includes('password_reset_expires')) {
    db.exec("ALTER TABLE users ADD COLUMN password_reset_expires TEXT");
  }

  /* Migration: payment_sessions tablosu */
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_sessions (
      token           TEXT PRIMARY KEY,
      user_id         TEXT NOT NULL,
      plan_name       TEXT NOT NULL,
      plan_period     TEXT NOT NULL,
      price           INTEGER NOT NULL,
      conversation_id TEXT NOT NULL,
      created_at      TEXT NOT NULL
    )
  `);

  /* Migration: subscriptions tablosu */
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      plan_name   TEXT NOT NULL,
      plan_period TEXT NOT NULL,
      price       INTEGER NOT NULL DEFAULT 0,
      status      TEXT NOT NULL DEFAULT 'active',
      starts_at   TEXT NOT NULL,
      expires_at  TEXT,
      notes       TEXT,
      created_at  TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log(`✅  Veritabanı hazır: ${DB_PATH}`);
  console.log('✅  Tablolar oluşturuldu (CREATE TABLE IF NOT EXISTS).');
}

// CLI: node database/db.js --init
if (require.main === module && process.argv.includes('--init')) {
  initDb();
  process.exit(0);
}

module.exports = { getDb, initDb };
