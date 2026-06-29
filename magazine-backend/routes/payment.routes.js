'use strict';

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const ctrl    = require('../controllers/payment.controller');

router.post('/init',     auth, ctrl.initPayment);
router.post('/callback',       ctrl.paymentCallback);

module.exports = router;
