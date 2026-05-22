'use strict';

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/casting.admin.controller');
const authMw     = require('../middleware/auth.middleware');
const adminMw    = require('../middleware/admin.middleware');

/* Tüm admin rotaları: önce JWT, sonra role kontrolü */
router.use(authMw, adminMw);

/* ── Dashboard özeti ── */
router.get('/dashboard', ctrl.getDashboard);

/* ── İlan listesi (tüm statüsler) ── */
router.get('/listings',              ctrl.getListings);
router.get('/listings/:id',          ctrl.getListing);
router.patch('/listings/:id/status', ctrl.updateStatus);
router.patch('/listings/:id/feature',ctrl.toggleFeatured);
router.delete('/listings/:id',       ctrl.deleteListing);

/* ── Talepler ── */
router.get('/inquiries',                    ctrl.getInquiries);
router.patch('/inquiries/:id/status',       ctrl.updateInquiryStatus);

/* ── Audit log ── */
router.get('/audit-logs', ctrl.getAuditLogs);

module.exports = router;
