'use strict';

const repo = require('../database/repos/casting.repo');

const VALID_STATUSES   = new Set(['PENDING','APPROVED','REJECTED','REVISION_REQUESTED','ARCHIVED']);
const VALID_INQ_STATUS = new Set(['NEW','CONTACTED','CLOSED']);

function s(str, max = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, max);
}

/* ═══════════════════════════════════════════
   GET /api/admin/casting/dashboard
═══════════════════════════════════════════ */
function getDashboard(_req, res) {
  try {
    const db = require('../database/db').getDb();
    const counts = db.prepare(`
      SELECT status, COUNT(*) AS n
      FROM casting_listings
      GROUP BY status
    `).all();

    const inquiryCount = db.prepare(`
      SELECT COUNT(*) AS n FROM casting_inquiries WHERE status = 'NEW'
    `).get().n;

    const statusMap = {};
    for (const row of counts) statusMap[row.status] = row.n;

    return res.json({
      success: true,
      dashboard: {
        listings: {
          pending:            statusMap['PENDING']            || 0,
          approved:           statusMap['APPROVED']           || 0,
          rejected:           statusMap['REJECTED']           || 0,
          revision_requested: statusMap['REVISION_REQUESTED'] || 0,
          archived:           statusMap['ARCHIVED']           || 0,
        },
        new_inquiries: inquiryCount,
      }
    });
  } catch (err) {
    console.error('[admin.getDashboard]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   GET /api/admin/casting/listings
═══════════════════════════════════════════ */
function getListings(req, res) {
  try {
    const result = repo.getAllListings({
      status:   req.query.status   || undefined,
      category: req.query.category || undefined,
      page:     req.query.page     || 1,
      limit:    req.query.limit    || 30,
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[admin.getListings]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   GET /api/admin/casting/listings/:id
═══════════════════════════════════════════ */
function getListing(req, res) {
  try {
    const listing = repo.getAdminListingById(s(req.params.id, 36));
    if (!listing) return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    return res.json({ success: true, listing });
  } catch (err) {
    console.error('[admin.getListing]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   PATCH /api/admin/casting/listings/:id/status
   body: { status, note? }
═══════════════════════════════════════════ */
function updateStatus(req, res) {
  try {
    const id     = s(req.params.id, 36);
    const status = s(req.body.status, 30).toUpperCase();
    const note   = s(req.body.note, 500) || null;

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz durum değeri.' });
    }

    const existing = repo.getAdminListingById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });

    repo.updateListingStatus(id, status, note);

    /* Audit log — hassas bilgi loglara yazılmaz */
    const actionMap = {
      APPROVED:           'APPROVE',
      REJECTED:           'REJECT',
      REVISION_REQUESTED: 'REQUEST_REVISION',
      ARCHIVED:           'ARCHIVE',
    };
    if (actionMap[status]) {
      repo.logAudit({
        admin_id:    req.user.id,
        action:      actionMap[status],
        target_type: 'LISTING',
        target_id:   id,
        note,
      });
    }

    return res.json({ success: true, message: 'İlan durumu güncellendi.' });
  } catch (err) {
    console.error('[admin.updateStatus]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   PATCH /api/admin/casting/listings/:id/feature
   body: { featured: true|false }
═══════════════════════════════════════════ */
function toggleFeatured(req, res) {
  try {
    const id         = s(req.params.id, 36);
    const isFeatured = req.body.featured === true || req.body.featured === 'true';

    const existing = repo.getAdminListingById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });

    repo.setFeatured(id, isFeatured);

    repo.logAudit({
      admin_id:    req.user.id,
      action:      isFeatured ? 'FEATURE' : 'UNFEATURE',
      target_type: 'LISTING',
      target_id:   id,
    });

    return res.json({ success: true, message: isFeatured ? 'İlan öne çıkarıldı.' : 'Öne çıkarma kaldırıldı.' });
  } catch (err) {
    console.error('[admin.toggleFeatured]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   DELETE /api/admin/casting/listings/:id
═══════════════════════════════════════════ */
function deleteListing(req, res) {
  try {
    const id = s(req.params.id, 36);
    const existing = repo.getAdminListingById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });

    repo.logAudit({
      admin_id:    req.user.id,
      action:      'DELETE',
      target_type: 'LISTING',
      target_id:   id,
      note:        `Silindi: ${existing.full_name}`,
    });

    repo.deleteListing(id);

    return res.json({ success: true, message: 'İlan silindi.' });
  } catch (err) {
    console.error('[admin.deleteListing]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   GET /api/admin/casting/inquiries
═══════════════════════════════════════════ */
function getInquiries(req, res) {
  try {
    const result = repo.getAllInquiries({
      status: req.query.status || undefined,
      page:   req.query.page   || 1,
      limit:  req.query.limit  || 30,
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[admin.getInquiries]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   PATCH /api/admin/casting/inquiries/:id/status
═══════════════════════════════════════════ */
function updateInquiryStatus(req, res) {
  try {
    const id     = s(req.params.id, 36);
    const status = s(req.body.status, 20).toUpperCase();

    if (!VALID_INQ_STATUS.has(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz durum değeri.' });
    }

    repo.updateInquiryStatus(id, status);

    repo.logAudit({
      admin_id:    req.user.id,
      action:      status === 'CONTACTED' ? 'INQUIRY_CONTACTED' : 'INQUIRY_CLOSED',
      target_type: 'INQUIRY',
      target_id:   id,
    });

    return res.json({ success: true, message: 'Talep durumu güncellendi.' });
  } catch (err) {
    console.error('[admin.updateInquiryStatus]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

/* ═══════════════════════════════════════════
   GET /api/admin/casting/audit-logs
═══════════════════════════════════════════ */
function getAuditLogs(req, res) {
  try {
    const result = repo.getAuditLogs({
      target_id: req.query.target_id || undefined,
      admin_id:  req.query.admin_id  || undefined,
      page:      req.query.page      || 1,
      limit:     req.query.limit     || 50,
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[admin.getAuditLogs]', err.message);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
}

module.exports = {
  getDashboard,
  getListings,
  getListing,
  updateStatus,
  toggleFeatured,
  deleteListing,
  getInquiries,
  updateInquiryStatus,
  getAuditLogs,
};
