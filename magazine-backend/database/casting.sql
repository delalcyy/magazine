-- ══════════════════════════════════════════════════════
--  FashionTV Magazine — Casting Modülü Şeması
--  Çalıştır: initDb() içinden otomatik yüklenir
-- ══════════════════════════════════════════════════════

-- ── Şehirler (dropdown, serbest text yok) ──
CREATE TABLE IF NOT EXISTS cities (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT    NOT NULL UNIQUE,
  country TEXT    NOT NULL DEFAULT 'TR'
);

INSERT OR IGNORE INTO cities (name) VALUES
  ('Adana'),('Adıyaman'),('Afyonkarahisar'),('Ağrı'),('Amasya'),
  ('Ankara'),('Antalya'),('Artvin'),('Aydın'),('Balıkesir'),
  ('Bilecik'),('Bingöl'),('Bitlis'),('Bolu'),('Burdur'),
  ('Bursa'),('Çanakkale'),('Çankırı'),('Çorum'),('Denizli'),
  ('Diyarbakır'),('Edirne'),('Elazığ'),('Erzincan'),('Erzurum'),
  ('Eskişehir'),('Gaziantep'),('Giresun'),('Gümüşhane'),('Hakkari'),
  ('Hatay'),('Isparta'),('İçel (Mersin)'),('İstanbul'),('İzmir'),
  ('Kars'),('Kastamonu'),('Kayseri'),('Kırklareli'),('Kırşehir'),
  ('Kocaeli'),('Konya'),('Kütahya'),('Malatya'),('Manisa'),
  ('Kahramanmaraş'),('Mardin'),('Muğla'),('Muş'),('Nevşehir'),
  ('Niğde'),('Ordu'),('Rize'),('Sakarya'),('Samsun'),
  ('Siirt'),('Sinop'),('Sivas'),('Tekirdağ'),('Tokat'),
  ('Trabzon'),('Tunceli'),('Şanlıurfa'),('Uşak'),('Van'),
  ('Yozgat'),('Zonguldak'),('Aksaray'),('Bayburt'),('Karaman'),
  ('Kırıkkale'),('Batman'),('Şırnak'),('Bartın'),('Ardahan'),
  ('Iğdır'),('Yalova'),('Karabük'),('Kilis'),('Osmaniye'),('Düzce');

-- ── Ana ilan tablosu ──
CREATE TABLE IF NOT EXISTS casting_listings (
  id            TEXT    PRIMARY KEY,                      -- UUID v4
  user_id       TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Public alanlar
  full_name     TEXT    NOT NULL CHECK(length(full_name) BETWEEN 2 AND 100),
  age           INTEGER NOT NULL CHECK(age >= 16 AND age <= 80),
  gender        TEXT    NOT NULL CHECK(gender IN ('erkek','kadin','diger')),
  city_id       INTEGER REFERENCES cities(id),
  city_name     TEXT    NOT NULL,
  district      TEXT    CHECK(district IS NULL OR length(district) <= 80),
  category      TEXT    NOT NULL CHECK(category IN ('model','manken','oyuncu','ic_giyim','spor_giyim','abiye_gelinlik')),
  description   TEXT    NOT NULL CHECK(length(description) BETWEEN 20 AND 2000),
  experience    TEXT    NOT NULL CHECK(experience IN ('yeni_baslayan','deneyimli','profesyonel')),

  -- Fiziksel özellikler
  height        INTEGER NOT NULL CHECK(height >= 100 AND height <= 250),
  weight        INTEGER NOT NULL CHECK(weight >= 30  AND weight <= 200),
  eye_color     TEXT    NOT NULL,
  hair_color    TEXT    NOT NULL,
  shoe_size     TEXT    NOT NULL,
  body_size     TEXT    NOT NULL,
  bust          TEXT,
  waist         TEXT,
  hips          TEXT,
  skin_tone     TEXT,

  -- Ek bilgiler (JSON dizisi olarak saklanır)
  languages     TEXT    NOT NULL DEFAULT '[]',
  skills        TEXT    NOT NULL DEFAULT '[]',
  prev_works    TEXT    CHECK(prev_works IS NULL OR length(prev_works) <= 1000),

  -- PRIVATE — public API response'da asla döndürülmez
  instagram     TEXT    CHECK(instagram IS NULL OR length(instagram) <= 100),
  phone         TEXT    CHECK(phone IS NULL OR length(phone) <= 20),
  contact_email TEXT    CHECK(contact_email IS NULL OR length(contact_email) <= 150),

  -- Admin yönetim alanları
  status        TEXT    NOT NULL DEFAULT 'PENDING'
                CHECK(status IN ('PENDING','APPROVED','REJECTED','REVISION_REQUESTED','ARCHIVED')),
  is_featured   INTEGER NOT NULL DEFAULT 0 CHECK(is_featured IN (0,1)),
  slug          TEXT    UNIQUE CHECK(slug IS NULL OR length(slug) <= 200),
  admin_note    TEXT    CHECK(admin_note IS NULL OR length(admin_note) <= 500),
  approved_at   TEXT,
  rejected_at   TEXT,

  -- Anti-spam honeypot (her zaman boş olmalı)
  honeypot      TEXT,

  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_listings_status   ON casting_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON casting_listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_city     ON casting_listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON casting_listings(is_featured);
CREATE INDEX IF NOT EXISTS idx_listings_user     ON casting_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_slug     ON casting_listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_created  ON casting_listings(created_at);

-- ── Görseller ──
CREATE TABLE IF NOT EXISTS casting_images (
  id          TEXT    PRIMARY KEY,                        -- UUID v4
  listing_id  TEXT    NOT NULL REFERENCES casting_listings(id) ON DELETE CASCADE,
  file_name   TEXT    NOT NULL,                           -- UUID tabanlı isim (orijinal isim saklanmaz)
  mime_type   TEXT    NOT NULL DEFAULT 'image/jpeg',
  width       INTEGER,
  height      INTEGER,
  size_bytes  INTEGER,
  type        TEXT    NOT NULL CHECK(type IN ('PROFILE','FULL_BODY','GALLERY')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_images_listing ON casting_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_images_type    ON casting_images(listing_id, type);

-- ── Thumbnail'lar ──
CREATE TABLE IF NOT EXISTS casting_thumbnails (
  id          TEXT    PRIMARY KEY,                        -- UUID v4
  image_id    TEXT    NOT NULL REFERENCES casting_images(id) ON DELETE CASCADE,
  file_name   TEXT    NOT NULL,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_thumbs_image ON casting_thumbnails(image_id);

-- ── Çalışma talepleri ──
CREATE TABLE IF NOT EXISTS casting_inquiries (
  id           TEXT    PRIMARY KEY,                       -- UUID v4
  listing_id   TEXT    NOT NULL REFERENCES casting_listings(id),
  full_name    TEXT    NOT NULL CHECK(length(full_name) BETWEEN 2 AND 100),
  phone        TEXT    NOT NULL CHECK(length(phone) BETWEEN 7 AND 20),
  email        TEXT    NOT NULL CHECK(length(email) BETWEEN 5 AND 150),
  company_name TEXT    CHECK(company_name IS NULL OR length(company_name) <= 150),
  project_type TEXT    NOT NULL CHECK(length(project_type) BETWEEN 2 AND 100),
  message      TEXT    NOT NULL CHECK(length(message) BETWEEN 10 AND 2000),
  honeypot     TEXT,
  status       TEXT    NOT NULL DEFAULT 'NEW'
               CHECK(status IN ('NEW','CONTACTED','CLOSED')),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON casting_inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status  ON casting_inquiries(status);

-- ── Audit log ──
CREATE TABLE IF NOT EXISTS casting_audit_logs (
  id          TEXT    PRIMARY KEY,                        -- UUID v4
  admin_id    TEXT    NOT NULL REFERENCES users(id),
  action      TEXT    NOT NULL CHECK(action IN (
                'APPROVE','REJECT','REQUEST_REVISION','ARCHIVE',
                'FEATURE','UNFEATURE','DELETE','UPDATE_NOTE',
                'INQUIRY_CONTACTED','INQUIRY_CLOSED'
              )),
  target_type TEXT    NOT NULL CHECK(target_type IN ('LISTING','INQUIRY')),
  target_id   TEXT    NOT NULL,
  note        TEXT    CHECK(note IS NULL OR length(note) <= 500),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_admin    ON casting_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_target   ON casting_audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON casting_audit_logs(created_at);
