'use strict';

const express        = require('express');
const router         = express.Router();
const authCtrl       = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/auth/register',             authCtrl.register);
router.post('/auth/login',                authCtrl.login);
router.get( '/auth/verify-email',         authCtrl.verifyEmail);
router.post('/auth/resend-verification',  authCtrl.resendVerification);
router.post('/auth/forgot-password',      authCtrl.forgotPassword);
router.post('/auth/reset-password',       authCtrl.resetPassword);
router.get( '/user/me', authMiddleware,   authCtrl.me);

module.exports = router;
