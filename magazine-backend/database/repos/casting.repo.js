'use strict';

/**
 * casting.repo.js — Casting modülü için veritabanı soyutlama katmanı.
 *
 * Tüm SQL bu dosyada. Controller'lar hiçbir zaman doğrudan SQL yazmaz.
 * Veritabanı PostgreSQL'e taşınırsa sadece bu dosyadaki sorgular değişir,
 * controller arayüzü aynı kalır.
 */

const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

/* ═══════════════════════════════════════════
   YARDIMCILAR
═══════════════════════════════════════════ */

/**
 * Public ilan response'u için whitelist builder.
 * Sadece burada listelenen alanlar dışarı çıkar.
 * Tüm objeyi spread edip alan silme yaklaşımı KULLANILMAZ.
 */
function buildPublicListing(row, images = []) {
  return {
    id:          row.id,
    full_name:   row.full_name,
    age:         row.age,
    gender:      row.gender,
    city_name:   row.city_name,
    district:    row.district    || null,
    category:    row.category,
    description: row.description,
    experience:  row.experience,
    height:      row.height,
    weight:      row.weight,
    eye_color:   row.eye_color,
    hair_color:  row.hair_color,
    shoe_size:   row.shoe_size,
    body_size:   row.body_size,
    bust:        row.bust        || null,
    waist:       row.waist       || null,
    hips:        row.hips        || null,
    skin_tone:   row.skin_tone   || null,
    languages:   safeParseJson(row.languages, []),
    skills:      safeParseJson(row.skills,    []),
    prev_works:  row.prev_works  || null,
    is_featured: row.is_featured === 1,
    slug:        row.slug,
    created_at:  row.created_at,
    images:      images.map(buildPublicImage),
  };
}

/**
 * Admin ilan response'u — tüm alanlar dahil private bilgiler.
 */
function buildAdminListing(row, images = []) {
  return {
    ...buildPublicListing(row, images),
    user_id:       row.user_id,
    instagram:     row.instagram      || null,
    phone:         row.phone          || null,
    contact_email: row.contact_email  || null,
    status:        row.status,
    admin_note:    row.admin_note     || null,
    approved_at:   row.approved_at    || null,
    rejected_at:   row.rejected_at    || null,
    created_at:    row.created_at,
    updated_at:    row.updated_at,
  };
}

function buildPublicImage(row) {
  return {
    id:         row.id,
    file_name:  row.file_name,
    type:       row.type,
    sort_order: row.sort_order,
    thumb:      row.thumb_file_name || null,
  };
}

function safeParseJson(str, fallback) {
  try   { return JSON.parse(str) || fallback; }
  catch { return fallback; }
}

/* ═══════════════════════════════════════════
   ŞEHİRLER
═══════════════════════════════════════════ */

function getCities() {
  return getDb()
    .prepare('SELECT id, name FROM cities WHERE country = ? ORDER BY name')
    .all('TR');
}

function getCityById(id) {
  return getDb()
    .prepare('SELECT id, name FROM cities WHERE id = ?')
    .get(id);
}

/* ═══════════════════════════════════════════
   İLANLAR — PUBLIC
═══════════════════════════════════════════ */

/**
 * Onaylı ilanları filtreler ve döndürür.
 * status kontrolü hem WHERE koşulunda hem dönen satırda doğrulanır.
 */
function getApprovedListings({ category, city_id, gender, experience,
  min_age, max_age, min_height, max_height,
  min_weight, max_weight, eye_color, hair_color,
  shoe_size, body_size, featured_only, has_photos,
  page = 1, limit = 20 } = {}) {

  const params  = [];
  const where   = ['l.status = ?'];
  params.push('APPROVED');

  if (category)     { where.push('l.category = ?');   params.push(category); }
  if (city_id)      { where.push('l.city_id = ?');    params.push(Number(city_id)); }
  if (gender)       { where.push('l.gender = ?');     params.push(gender); }
  if (experience)   { where.push('l.experience = ?'); params.push(experience); }
  if (min_age)      { where.push('l.age >= ?');       params.push(Number(min_age)); }
  if (max_age)      { where.push('l.age <= ?');       params.push(Number(max_age)); }
  if (min_height)   { where.push('l.height >= ?');    params.push(Number(min_height)); }
  if (max_height)   { where.push('l.height <= ?');    params.push(Number(max_height)); }
  if (min_weight)   { where.push('l.weight >= ?');    params.push(Number(min_weight)); }
  if (max_weight)   { where.push('l.weight <= ?');    params.push(Number(max_weight)); }
  if (eye_color)    { where.push('l.eye_color = ?');  params.push(eye_color); }
  if (hair_color)   { where.push('l.hair_color = ?'); params.push(hair_color); }
  if (shoe_size)    { where.push('l.shoe_size = ?');  params.push(shoe_size); }
  if (body_size)    { where.push('l.body_size = ?');  params.push(body_size); }
  if (featured_only === 'true' || featured_only === true) {
    where.push('l.is_featured = 1');
  }
  if (has_photos === 'true' || has_photos === true) {
    where.push('EXISTS (SELECT 1 FROM casting_images ci WHERE ci.listing_id = l.id)');
  }

  const offset   = (Math.max(1, Number(page)) - 1) * Math.min(50, Number(limit));
  const perPage  = Math.min(50, Number(limit));
  const whereStr = where.join(' AND ');

  const total = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM casting_listings l WHERE ${whereStr}`)
    .get(...params).n;

  const rows = getDb()
    .prepare(`
      SELECT l.*,
             (SELECT file_name FROM casting_images
              WHERE listing_id = l.id AND type = 'PROFILE'
              ORDER BY sort_order LIMIT 1) AS profile_image
      FROM casting_listings l
      WHERE ${whereStr}
      ORDER BY l.is_featured DESC, l.approved_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(...params, perPage, offset);

  /* Controller seviyesinde status tekrar doğrulanır */
  const listings = rows
    .filter(r => r.status === 'APPROVED')
    .map(r => buildPublicListing(r, getImagesByListing(r.id)));

  return { listings, total, page: Number(page), limit: perPage };
}

function getApprovedListingBySlug(slug) {
  const row = getDb()
    .prepare(`
      SELECT l.* FROM casting_listings l
      WHERE l.slug = ? AND l.status = 'APPROVED'
    `)
    .get(slug);
  if (!row || row.status !== 'APPROVED') return null;   // çift kontrol

  const images = getImagesByListing(row.id);
  return buildPublicListing(row, images);
}

function getApprovedListingById(id) {
  const row = getDb()
    .prepare(`SELECT * FROM casting_listings WHERE id = ? AND status = 'APPROVED'`)
    .get(id);
  if (!row || row.status !== 'APPROVED') return null;

  const images = getImagesByListing(id);
  return buildPublicListing(row, images);
}

/* ═══════════════════════════════════════════
   İLANLAR — KULLANICI
═══════════════════════════════════════════ */

function createListing(data) {
  const id   = uuidv4();
  const slug = data.slug || null;
  getDb().prepare(`
    INSERT INTO casting_listings (
      id, user_id, full_name, age, gender, city_id, city_name, district,
      category, description, experience,
      height, weight, eye_color, hair_color, shoe_size, body_size,
      bust, waist, hips, skin_tone,
      languages, skills, prev_works,
      instagram, phone, contact_email,
      honeypot, slug
    ) VALUES (
      ?,?,?,?,?,?,?,?,
      ?,?,?,
      ?,?,?,?,?,?,
      ?,?,?,?,
      ?,?,?,
      ?,?,?,
      ?,?
    )
  `).run(
    id, data.user_id, data.full_name, data.age, data.gender,
    data.city_id || null, data.city_name, data.district || null,
    data.category, data.description, data.experience,
    data.height, data.weight, data.eye_color, data.hair_color,
    data.shoe_size, data.body_size,
    data.bust || null, data.waist || null, data.hips || null, data.skin_tone || null,
    JSON.stringify(data.languages || []),
    JSON.stringify(data.skills    || []),
    data.prev_works    || null,
    data.instagram     || null,
    data.phone         || null,
    data.contact_email || null,
    data.honeypot      || null,
    slug
  );
  return id;
}

function getListingsByUser(userId) {
  const rows = getDb()
    .prepare(`
      SELECT id, full_name, category, city_name, status, is_featured,
             slug, created_at, updated_at
      FROM casting_listings
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
    .all(userId);
  return rows;
}

/* ═══════════════════════════════════════════
   İLANLAR — ADMIN
═══════════════════════════════════════════ */

function getAllListings({ status, category, page = 1, limit = 30 } = {}) {
  const params = [];
  const where  = [];
  if (status)   { where.push('status = ?');   params.push(status); }
  if (category) { where.push('category = ?'); params.push(category); }

  const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset   = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  const perPage  = Math.min(100, Number(limit));

  const total = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM casting_listings ${whereStr}`)
    .get(...params).n;

  const rows = getDb()
    .prepare(`
      SELECT * FROM casting_listings ${whereStr}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(...params, perPage, offset);

  return { listings: rows.map(r => buildAdminListing(r)), total, page: Number(page), limit: perPage };
}

function getAdminListingById(id) {
  const row = getDb()
    .prepare('SELECT * FROM casting_listings WHERE id = ?')
    .get(id);
  if (!row) return null;
  const images = getImagesByListing(id);
  return buildAdminListing(row, images);
}

function updateListingStatus(id, status, adminNote = null) {
  const now       = new Date().toISOString();
  const approvedAt = status === 'APPROVED'  ? now : null;
  const rejectedAt = status === 'REJECTED'  ? now : null;

  getDb().prepare(`
    UPDATE casting_listings
    SET status = ?, admin_note = ?, approved_at = ?, rejected_at = ?, updated_at = ?
    WHERE id = ?
  `).run(status, adminNote, approvedAt, rejectedAt, now, id);
}

function setFeatured(id, isFeatured) {
  getDb().prepare(`
    UPDATE casting_listings SET is_featured = ?, updated_at = ? WHERE id = ?
  `).run(isFeatured ? 1 : 0, new Date().toISOString(), id);
}

function deleteListing(id) {
  getDb().prepare('DELETE FROM casting_listings WHERE id = ?').run(id);
}

/* ═══════════════════════════════════════════
   GÖRSELLER
═══════════════════════════════════════════ */

function addImage({ listing_id, file_name, mime_type, width, height, size_bytes, type, sort_order }) {
  const id = uuidv4();
  getDb().prepare(`
    INSERT INTO casting_images
      (id, listing_id, file_name, mime_type, width, height, size_bytes, type, sort_order)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(id, listing_id, file_name, mime_type, width, height, size_bytes, type, sort_order);
  return id;
}

function addThumbnail({ image_id, file_name, width, height }) {
  const id = uuidv4();
  getDb().prepare(`
    INSERT INTO casting_thumbnails (id, image_id, file_name, width, height)
    VALUES (?,?,?,?,?)
  `).run(id, image_id, file_name, width, height);
  return id;
}

function getImagesByListing(listingId) {
  return getDb().prepare(`
    SELECT i.*, t.file_name AS thumb_file_name
    FROM casting_images i
    LEFT JOIN casting_thumbnails t ON t.image_id = i.id
    WHERE i.listing_id = ?
    ORDER BY i.sort_order ASC
  `).all(listingId);
}

function deleteImagesByListing(listingId) {
  getDb().prepare('DELETE FROM casting_images WHERE listing_id = ?').run(listingId);
}

/* ═══════════════════════════════════════════
   TALEPLER
═══════════════════════════════════════════ */

function createInquiry(data) {
  const id = uuidv4();
  getDb().prepare(`
    INSERT INTO casting_inquiries
      (id, listing_id, full_name, phone, email, company_name, project_type, message, honeypot)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(
    id, data.listing_id, data.full_name, data.phone, data.email,
    data.company_name || null, data.project_type, data.message,
    data.honeypot || null
  );
  return id;
}

function getAllInquiries({ status, page = 1, limit = 30 } = {}) {
  const params = [];
  const where  = [];
  if (status) { where.push('i.status = ?'); params.push(status); }

  const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset   = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  const perPage  = Math.min(100, Number(limit));

  const total = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM casting_inquiries i ${whereStr}`)
    .get(...params).n;

  const rows = getDb()
    .prepare(`
      SELECT i.*, l.full_name AS listing_name, l.category AS listing_category
      FROM casting_inquiries i
      LEFT JOIN casting_listings l ON l.id = i.listing_id
      ${whereStr}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(...params, perPage, offset);

  return { inquiries: rows, total, page: Number(page), limit: perPage };
}

function updateInquiryStatus(id, status) {
  getDb().prepare(`
    UPDATE casting_inquiries SET status = ?, updated_at = ? WHERE id = ?
  `).run(status, new Date().toISOString(), id);
}

/* ═══════════════════════════════════════════
   AUDİT LOG
═══════════════════════════════════════════ */

function logAudit({ admin_id, action, target_type, target_id, note = null }) {
  const id = uuidv4();
  getDb().prepare(`
    INSERT INTO casting_audit_logs (id, admin_id, action, target_type, target_id, note)
    VALUES (?,?,?,?,?,?)
  `).run(id, admin_id, action, target_type, target_id, note);
}

function getAuditLogs({ target_id, admin_id, page = 1, limit = 50 } = {}) {
  const params = [];
  const where  = [];
  if (target_id) { where.push('a.target_id = ?');  params.push(target_id); }
  if (admin_id)  { where.push('a.admin_id = ?');   params.push(admin_id); }

  const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset   = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  const perPage  = Math.min(100, Number(limit));

  const total = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM casting_audit_logs a ${whereStr}`)
    .get(...params).n;

  const rows = getDb()
    .prepare(`
      SELECT a.*, u.first_name || ' ' || u.last_name AS admin_name
      FROM casting_audit_logs a
      LEFT JOIN users u ON u.id = a.admin_id
      ${whereStr}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(...params, perPage, offset);

  return { logs: rows, total, page: Number(page), limit: perPage };
}

/* ═══════════════════════════════════════════
   SLUG
═══════════════════════════════════════════ */

function slugExists(slug) {
  return !!getDb()
    .prepare('SELECT 1 FROM casting_listings WHERE slug = ?')
    .get(slug);
}

function updateSlug(id, slug) {
  getDb().prepare('UPDATE casting_listings SET slug = ? WHERE id = ?').run(slug, id);
}

module.exports = {
  // Şehirler
  getCities,
  getCityById,
  // Public
  getApprovedListings,
  getApprovedListingBySlug,
  getApprovedListingById,
  // Kullanıcı
  createListing,
  getListingsByUser,
  // Admin
  getAllListings,
  getAdminListingById,
  updateListingStatus,
  setFeatured,
  deleteListing,
  // Görseller
  addImage,
  addThumbnail,
  getImagesByListing,
  deleteImagesByListing,
  // Talepler
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
  // Audit
  logAudit,
  getAuditLogs,
  // Slug
  slugExists,
  updateSlug,
};
