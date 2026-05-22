'use strict';

const slugify = require('slugify');
const repo    = require('../database/repos/casting.repo');

/* ── Input sanitization ── */
function s(str, max = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, max);
}
function sInt(val, min, max) {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < min || n > max) return null;
  return n;
}
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

const VALID_GENDERS    = new Set(['erkek','kadin','diger']);
const VALID_CATEGORIES = new Set(['model','manken','oyuncu','ic_giyim','spor_giyim','abiye_gelinlik']);
const VALID_EXPERIENCE = new Set(['yeni_baslayan','deneyimli','profesyonel']);

/* ═══════════════════════════════════════════
   GET /api/casting/cities
═══════════════════════════════════════════ */
function getCities(_req, res) {
  try {
    return res.json({ success: true, cities: repo.getCities() });
  } catch (err) {
    console.error('[casting.getCities]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   GET /api/casting/listings
═══════════════════════════════════════════ */
function getListings(req, res) {
  try {
    const filters = {
      category:     VALID_CATEGORIES.has(req.query.category)  ? req.query.category  : undefined,
      gender:       VALID_GENDERS.has(req.query.gender)        ? req.query.gender    : undefined,
      experience:   VALID_EXPERIENCE.has(req.query.experience) ? req.query.experience: undefined,
      city_id:      req.query.city_id    ? parseInt(req.query.city_id, 10)    : undefined,
      min_age:      req.query.min_age    ? parseInt(req.query.min_age, 10)    : undefined,
      max_age:      req.query.max_age    ? parseInt(req.query.max_age, 10)    : undefined,
      min_height:   req.query.min_height ? parseInt(req.query.min_height, 10) : undefined,
      max_height:   req.query.max_height ? parseInt(req.query.max_height, 10) : undefined,
      min_weight:   req.query.min_weight ? parseInt(req.query.min_weight, 10) : undefined,
      max_weight:   req.query.max_weight ? parseInt(req.query.max_weight, 10) : undefined,
      eye_color:    req.query.eye_color  ? s(req.query.eye_color,  30) : undefined,
      hair_color:   req.query.hair_color ? s(req.query.hair_color, 30) : undefined,
      shoe_size:    req.query.shoe_size  ? s(req.query.shoe_size,  10) : undefined,
      body_size:    req.query.body_size  ? s(req.query.body_size,  10) : undefined,
      featured_only:req.query.featured_only,
      has_photos:   req.query.has_photos,
      page:         req.query.page  || 1,
      limit:        req.query.limit || 20,
    };

    const result = repo.getApprovedListings(filters);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[casting.getListings]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   GET /api/casting/listings/:slugOrId
═══════════════════════════════════════════ */
function getListing(req, res) {
  try {
    const param = s(req.params.slugOrId, 200);
    if (!param) return res.status(400).json({ success: false, message: 'Geçersiz parametre.' });

    /* Önce slug ile dene, uuid formatındaysa id ile dene */
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(param);
    const listing = isUuid
      ? repo.getApprovedListingById(param)
      : (repo.getApprovedListingBySlug(param) || repo.getApprovedListingById(param));

    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }
    return res.json({ success: true, listing });
  } catch (err) {
    console.error('[casting.getListing]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   GET /api/casting/my-listings  (auth gerekli)
═══════════════════════════════════════════ */
function getMyListings(req, res) {
  try {
    const listings = repo.getListingsByUser(req.user.id);
    return res.json({ success: true, listings });
  } catch (err) {
    console.error('[casting.getMyListings]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   POST /api/casting/listings  (auth + upload)
═══════════════════════════════════════════ */
async function createListing(req, res) {
  try {
    const b = req.body;

    /* Honeypot kontrolü — bot tuzağı doluysa sessizce başarılı göster */
    if (b.honeypot && b.honeypot.trim() !== '') {
      return res.status(201).json({
        success: true,
        message: 'Başvurunuz alınmıştır. Ekibimiz inceleme yaptıktan sonra sizinle iletişime geçecektir.'
      });
    }

    /* ── Zorunlu alan validasyonu ── */
    const errors = [];

    const full_name = s(b.full_name, 100);
    if (!full_name || full_name.length < 2) errors.push('Ad soyad zorunludur (min 2 karakter).');

    const age = sInt(b.age, 16, 80);
    if (age === null) errors.push('Yaş 16-80 arasında olmalıdır.');

    if (!VALID_GENDERS.has(b.gender))    errors.push('Geçersiz cinsiyet değeri.');
    if (!VALID_CATEGORIES.has(b.category)) errors.push('Geçersiz kategori.');
    if (!VALID_EXPERIENCE.has(b.experience)) errors.push('Geçersiz deneyim değeri.');

    const city_id   = b.city_id ? parseInt(b.city_id, 10) : null;
    const city_name = s(b.city_name, 80);
    if (!city_name) errors.push('Şehir zorunludur.');

    const description = s(b.description, 2000);
    if (!description || description.length < 20) errors.push('Açıklama en az 20 karakter olmalıdır.');

    const height = sInt(b.height, 100, 250);
    if (height === null) errors.push('Boy 100-250 cm arasında olmalıdır.');

    const weight = sInt(b.weight, 30, 200);
    if (weight === null) errors.push('Kilo 30-200 kg arasında olmalıdır.');

    if (!s(b.eye_color,  30)) errors.push('Göz rengi zorunludur.');
    if (!s(b.hair_color, 30)) errors.push('Saç rengi zorunludur.');
    if (!s(b.shoe_size,  10)) errors.push('Ayakkabı numarası zorunludur.');
    if (!s(b.body_size,  10)) errors.push('Beden zorunludur.');

    /* Diller ve yetenekler: JSON array */
    let languages = [];
    let skills    = [];
    try { languages = Array.isArray(JSON.parse(b.languages)) ? JSON.parse(b.languages) : []; } catch { /**/ }
    try { skills    = Array.isArray(JSON.parse(b.skills))    ? JSON.parse(b.skills)    : []; } catch { /**/ }

    /* Email (private) */
    const contact_email = s(b.contact_email, 150);
    if (contact_email && !isValidEmail(contact_email)) errors.push('Geçersiz e-posta adresi.');

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    /* ── Slug oluştur ── */
    const baseSlug = slugify(full_name, { lower: true, strict: true, locale: 'tr' });
    let slug = baseSlug;
    let attempt = 0;
    while (repo.slugExists(slug)) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    /* ── İlanı oluştur ── */
    const listingId = repo.createListing({
      user_id:       req.user.id,
      full_name,
      age,
      gender:        b.gender,
      city_id,
      city_name,
      district:      s(b.district, 80)      || null,
      category:      b.category,
      description,
      experience:    b.experience,
      height,
      weight,
      eye_color:     s(b.eye_color,  30),
      hair_color:    s(b.hair_color, 30),
      shoe_size:     s(b.shoe_size,  10),
      body_size:     s(b.body_size,  10),
      bust:          s(b.bust,       20) || null,
      waist:         s(b.waist,      20) || null,
      hips:          s(b.hips,       20) || null,
      skin_tone:     s(b.skin_tone,  30) || null,
      languages,
      skills,
      prev_works:    s(b.prev_works,  1000) || null,
      instagram:     s(b.instagram,    100) || null,
      phone:         s(b.phone,         20) || null,
      contact_email: contact_email          || null,
      honeypot:      null,
      slug,
    });

    /* ── Görselleri kaydet ── */
    if (req.processedImages && req.processedImages.length > 0) {
      const typeMap = { profile: 'PROFILE', full_body: 'FULL_BODY', images: 'GALLERY' };

      for (let i = 0; i < req.processedImages.length; i++) {
        const img  = req.processedImages[i];
        const type = typeMap[img.fieldname] || 'GALLERY';

        const imageId = repo.addImage({
          listing_id: listingId,
          file_name:  img.fileName,
          mime_type:  img.mimeType,
          width:      img.width,
          height:     img.height,
          size_bytes: img.sizeBytes,
          type,
          sort_order: i,
        });

        repo.addThumbnail({
          image_id:  imageId,
          file_name: img.thumbName,
          width:     400,
          height:    500,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Başvurunuz alınmıştır. Ekibimiz inceleme yaptıktan sonra sizinle iletişime geçecektir.',
      id: listingId,
      slug,
    });

  } catch (err) {
    console.error('[casting.createListing]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' });
  }
}

/* ═══════════════════════════════════════════
   POST /api/casting/inquiries
═══════════════════════════════════════════ */
function createInquiry(req, res) {
  try {
    const b = req.body;

    /* Honeypot */
    if (b.honeypot && b.honeypot.trim() !== '') {
      return res.status(201).json({
        success: true,
        message: 'Talebiniz alınmıştır. Ekibimiz en kısa sürede sizinle iletişime geçecektir.'
      });
    }

    /* Validasyon */
    const errors = [];
    const full_name    = s(b.full_name, 100);
    const phone        = s(b.phone, 20);
    const email        = s(b.email, 150);
    const project_type = s(b.project_type, 100);
    const message      = s(b.message, 2000);
    const listing_id   = s(b.listing_id, 36);

    if (!full_name || full_name.length < 2) errors.push('Ad soyad zorunludur.');
    if (!phone || phone.length < 7)         errors.push('Telefon numarası zorunludur.');
    if (!email || !isValidEmail(email))      errors.push('Geçerli bir e-posta giriniz.');
    if (!project_type)                       errors.push('Proje türü zorunludur.');
    if (!message || message.length < 10)     errors.push('Mesaj en az 10 karakter olmalıdır.');
    if (!listing_id)                         errors.push('İlan bilgisi eksik.');

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    repo.createInquiry({
      listing_id,
      full_name,
      phone,
      email,
      company_name:  s(b.company_name, 150) || null,
      project_type,
      message,
      honeypot:      null,
    });

    return res.status(201).json({
      success: true,
      message: 'Talebiniz alınmıştır. Ekibimiz en kısa sürede sizinle iletişime geçecektir.'
    });

  } catch (err) {
    console.error('[casting.createInquiry]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

module.exports = {
  getCities,
  getListings,
  getListing,
  getMyListings,
  createListing,
  createInquiry,
};
