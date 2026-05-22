'use strict';

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/casting.controller');
const authMw   = require('../middleware/auth.middleware');
const { castingPublicLimit, castingApplyLimit, castingInquiryLimit } = require('../middleware/rateLimit.middleware');
const { multerUpload, processUploadedFiles, handleMulterError }      = require('../middleware/upload.middleware');

/* ── Şehir listesi ── */
router.get('/cities', castingPublicLimit, ctrl.getCities);

/* ── Onaylı ilan listesi (filtreli) ── */
router.get('/listings', castingPublicLimit, ctrl.getListings);

/* ── İlan detayı: slug veya id ile ── */
router.get('/listings/:slugOrId', castingPublicLimit, ctrl.getListing);

/* ── Kullanıcının kendi ilanları ── */
router.get('/my-listings', authMw, ctrl.getMyListings);

/* ── Yeni ilan başvurusu (oturum zorunlu + rate limit + upload) ── */
router.post(
  '/listings',
  authMw,
  castingApplyLimit,
  (req, res, next) => multerUpload.fields([
    { name: 'profile',   maxCount: 1 },
    { name: 'full_body', maxCount: 1 },
    { name: 'images',    maxCount: 8 },
  ])(req, res, err => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  }),
  processUploadedFiles,
  ctrl.createListing
);

/* ── Çalışma talebi gönder ── */
router.post('/inquiries', castingInquiryLimit, ctrl.createInquiry);

module.exports = router;
