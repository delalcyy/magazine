'use strict';

const express        = require('express');
const router         = express.Router();
const auth           = require('../middleware/auth.middleware');
const admin          = require('../middleware/admin.middleware');
const ctrl           = require('../controllers/admin.controller');

router.use(auth, admin);

router.get('/stats',                ctrl.stats);
router.get('/users/search',         ctrl.searchUsers);
router.get('/users',                ctrl.listUsers);
router.patch('/users/:id',          ctrl.updateUser);
router.delete('/users/:id',         ctrl.deleteUser);

router.get('/subscriptions',        ctrl.listSubscriptions);
router.post('/subscriptions',       ctrl.createSubscription);
router.patch('/subscriptions/:id',  ctrl.updateSubscription);
router.delete('/subscriptions/:id', ctrl.deleteSubscription);

module.exports = router;
