'use strict';

const Iyzipay      = require('iyzipay');
const { randomUUID } = require('crypto');
const { getDb }    = require('../database/db');

function getIyzipay() {
  return new Iyzipay({
    apiKey:    process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri:       process.env.IYZICO_URI || 'https://sandbox.iyzipay.com'
  });
}

function calcExpiry(period, from) {
  const d = new Date(from);
  const months = { '3-aylik':3, '6-aylik':6, '9-aylik':9, '1-yillik':12, '3-yillik':36, '5-yillik':60 };
  d.setMonth(d.getMonth() + (months[period] || 1));
  return d.toISOString();
}

/* POST /api/payment/init */
function initPayment(req, res) {
  const { plan_name, plan_period, price } = req.body;
  if (!plan_name || !plan_period || !price) {
    return res.status(400).json({ success: false, message: 'Plan bilgileri eksik.' });
  }

  const user          = req.user;
  const iyzipay       = getIyzipay();
  const conversationId = randomUUID();
  const callbackUrl   = `${process.env.FRONTEND_URL}/api/payment/callback`;
  const priceStr      = String(parseFloat(price).toFixed(2));

  const request = {
    locale:               Iyzipay.LOCALE.TR,
    conversationId,
    price:                priceStr,
    paidPrice:            priceStr,
    currency:             Iyzipay.CURRENCY.TRY,
    basketId:             conversationId,
    paymentGroup:         Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    callbackUrl,
    enabledInstallments:  [1, 2, 3, 6, 9],
    buyer: {
      id:                  user.id,
      name:                user.first_name,
      surname:             user.last_name,
      gsmNumber:           '+905350000000',
      email:               user.email,
      identityNumber:      '11111111111',
      lastLoginDate:       new Date().toISOString().replace('T',' ').split('.')[0],
      registrationDate:    new Date().toISOString().replace('T',' ').split('.')[0],
      registrationAddress: 'Türkiye',
      ip:                  (req.headers['x-forwarded-for'] || req.ip || '85.34.78.112').split(',')[0].trim(),
      city:                'Istanbul',
      country:             'Turkey',
      zipCode:             '34000'
    },
    shippingAddress: {
      contactName: user.first_name + ' ' + user.last_name,
      city:    'Istanbul',
      country: 'Turkey',
      address: 'Türkiye',
      zipCode: '34000'
    },
    billingAddress: {
      contactName: user.first_name + ' ' + user.last_name,
      city:    'Istanbul',
      country: 'Turkey',
      address: 'Türkiye',
      zipCode: '34000'
    },
    basketItems: [{
      id:        plan_name + '-' + plan_period,
      name:      `FashionTV Magazine ${plan_name} - ${plan_period}`,
      category1: 'Abonelik',
      itemType:  Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
      price:     priceStr
    }]
  };

  iyzipay.checkoutFormInitialize.create(request, (err, result) => {
    if (err) {
      console.error('[iyzipay init error]', err);
      return res.status(500).json({ success: false, message: 'Ödeme servisi yanıt vermedi.' });
    }
    if (result.status !== 'success') {
      console.error('[iyzipay init fail]', result.errorMessage);
      return res.status(400).json({ success: false, message: result.errorMessage || 'Ödeme başlatılamadı.' });
    }

    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO payment_sessions (token, user_id, plan_name, plan_period, price, conversation_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(result.token, user.id, plan_name, plan_period, parseInt(price), conversationId, new Date().toISOString());

    res.json({ success: true, checkoutFormContent: result.checkoutFormContent, token: result.token });
  });
}

/* POST /api/payment/callback — Iyzico buraya POST atar */
function paymentCallback(req, res) {
  const { token } = req.body;
  const frontendUrl = process.env.FRONTEND_URL || '';

  if (!token) return res.redirect(frontendUrl + '/odeme-basarisiz?error=no_token');

  const db      = getDb();
  const session = db.prepare('SELECT * FROM payment_sessions WHERE token = ?').get(token);
  if (!session) return res.redirect(frontendUrl + '/odeme-basarisiz?error=session_not_found');

  const iyzipay = getIyzipay();
  iyzipay.checkoutForm.retrieve({
    locale:         Iyzipay.LOCALE.TR,
    conversationId: session.conversation_id,
    token
  }, (err, result) => {
    if (err) {
      console.error('[iyzipay callback error]', err);
      return res.redirect(frontendUrl + '/odeme-basarisiz?error=callback_error');
    }

    if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
      const msg = encodeURIComponent(result.errorMessage || 'Ödeme başarısız');
      return res.redirect(frontendUrl + '/odeme-basarisiz?error=' + msg);
    }

    const now      = new Date().toISOString();
    const expiresAt = calcExpiry(session.plan_period, now);

    db.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_name, plan_period, price, status, starts_at, expires_at, notes, created_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `).run(randomUUID(), session.user_id, session.plan_name, session.plan_period, session.price, now, expiresAt, 'Iyzico #' + result.paymentId, now);

    db.prepare('DELETE FROM payment_sessions WHERE token = ?').run(token);

    res.redirect(frontendUrl + '/odeme-basarili?plan=' + encodeURIComponent(session.plan_name));
  });
}

module.exports = { initPayment, paymentCallback };
