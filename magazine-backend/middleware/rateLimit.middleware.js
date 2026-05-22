'use strict';

const rateLimit = require('express-rate-limit');

/* Başvuru formu: IP başına 5 başvuru / saat */
const castingApplyLimit = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: 'Çok fazla başvuru gönderildi. Lütfen 1 saat sonra tekrar deneyin.'
  },
  skipSuccessfulRequests: false,
});

/* Talep formu: IP başına 10 talep / saat */
const castingInquiryLimit = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: 'Çok fazla talep gönderildi. Lütfen 1 saat sonra tekrar deneyin.'
  },
});

/* Genel public API: 100 istek / dakika */
const castingPublicLimit = rateLimit({
  windowMs:        60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.'
  },
});

module.exports = {
  castingApplyLimit,
  castingInquiryLimit,
  castingPublicLimit,
};
