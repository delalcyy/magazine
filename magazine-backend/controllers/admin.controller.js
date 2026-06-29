'use strict';

const { getDb } = require('../database/db');
const { randomUUID } = require('crypto');

/* ── Stats ── */
function stats(req, res) {
  const db = getDb();
  const totalUsers  = db.prepare("SELECT COUNT(*) as n FROM users").get().n;
  const verifiedUsers = db.prepare("SELECT COUNT(*) as n FROM users WHERE email_verified=1").get().n;
  const totalSubs   = db.prepare("SELECT COUNT(*) as n FROM subscriptions").get().n;
  const activeSubs  = db.prepare("SELECT COUNT(*) as n FROM subscriptions WHERE status='active'").get().n;
  const recentUsers = db.prepare("SELECT id,first_name,last_name,email,role,email_verified,created_at FROM users ORDER BY created_at DESC LIMIT 5").all();
  const recentSubs  = db.prepare(`
    SELECT s.*, u.first_name, u.last_name, u.email
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.created_at DESC LIMIT 5
  `).all();

  res.json({ success: true, data: { totalUsers, verifiedUsers, totalSubs, activeSubs, recentUsers, recentSubs } });
}

/* ── Users ── */
function listUsers(req, res) {
  const db = getDb();
  const { q, role, verified, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = [];

  if (q) {
    where.push("(first_name || ' ' || last_name || ' ' || email LIKE ?)");
    params.push(`%${q}%`);
  }
  if (role) { where.push("role = ?"); params.push(role); }
  if (verified !== undefined && verified !== '') {
    where.push("email_verified = ?");
    params.push(parseInt(verified));
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) as n FROM users ${whereClause}`).get(...params).n;
  const users = db.prepare(`
    SELECT id, first_name, last_name, email, role, email_verified, created_at
    FROM users ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ success: true, data: users, total, page: parseInt(page), limit: parseInt(limit) });
}

function updateUser(req, res) {
  const db = getDb();
  const { id } = req.params;
  const { role, email_verified } = req.body;

  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
  if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });

  if (role !== undefined) {
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
  }
  if (email_verified !== undefined) {
    db.prepare("UPDATE users SET email_verified = ? WHERE id = ?").run(email_verified ? 1 : 0, id);
  }

  const updated = db.prepare("SELECT id,first_name,last_name,email,role,email_verified,created_at FROM users WHERE id=?").get(id);
  res.json({ success: true, data: updated });
}

function deleteUser(req, res) {
  const db = getDb();
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ success: false, message: 'Kendi hesabınızı silemezsiniz.' });
  const r = db.prepare("DELETE FROM users WHERE id = ?").run(id);
  if (r.changes === 0) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
  res.json({ success: true, message: 'Kullanıcı silindi.' });
}

/* ── Subscriptions ── */
function listSubscriptions(req, res) {
  const db = getDb();
  const { q, status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = [];

  if (q) {
    where.push("(u.first_name || ' ' || u.last_name || ' ' || u.email || ' ' || s.plan_name LIKE ?)");
    params.push(`%${q}%`);
  }
  if (status) { where.push("s.status = ?"); params.push(status); }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) as n FROM subscriptions s JOIN users u ON u.id=s.user_id ${whereClause}`).get(...params).n;
  const subs = db.prepare(`
    SELECT s.*, u.first_name, u.last_name, u.email
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    ${whereClause}
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ success: true, data: subs, total, page: parseInt(page), limit: parseInt(limit) });
}

function createSubscription(req, res) {
  const db = getDb();
  const { user_id, plan_name, plan_period, price, status = 'active', starts_at, expires_at, notes } = req.body;

  if (!user_id || !plan_name || !plan_period) {
    return res.status(400).json({ success: false, message: 'user_id, plan_name ve plan_period zorunludur.' });
  }

  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(user_id);
  if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });

  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO subscriptions (id, user_id, plan_name, plan_period, price, status, starts_at, expires_at, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, user_id, plan_name, plan_period, parseInt(price) || 0, status, starts_at || now, expires_at || null, notes || null, now);

  const sub = db.prepare(`
    SELECT s.*, u.first_name, u.last_name, u.email
    FROM subscriptions s JOIN users u ON u.id=s.user_id
    WHERE s.id=?
  `).get(id);
  res.status(201).json({ success: true, data: sub });
}

function updateSubscription(req, res) {
  const db = getDb();
  const { id } = req.params;
  const { plan_name, plan_period, price, status, starts_at, expires_at, notes } = req.body;

  const sub = db.prepare("SELECT id FROM subscriptions WHERE id = ?").get(id);
  if (!sub) return res.status(404).json({ success: false, message: 'Abonelik bulunamadı.' });

  const fields = [];
  const vals = [];
  if (plan_name  !== undefined) { fields.push('plan_name=?');  vals.push(plan_name); }
  if (plan_period!== undefined) { fields.push('plan_period=?'); vals.push(plan_period); }
  if (price      !== undefined) { fields.push('price=?');      vals.push(parseInt(price)); }
  if (status     !== undefined) { fields.push('status=?');     vals.push(status); }
  if (starts_at  !== undefined) { fields.push('starts_at=?');  vals.push(starts_at); }
  if (expires_at !== undefined) { fields.push('expires_at=?'); vals.push(expires_at); }
  if (notes      !== undefined) { fields.push('notes=?');      vals.push(notes); }

  if (fields.length) db.prepare(`UPDATE subscriptions SET ${fields.join(',')} WHERE id=?`).run(...vals, id);

  const updated = db.prepare(`
    SELECT s.*, u.first_name, u.last_name, u.email
    FROM subscriptions s JOIN users u ON u.id=s.user_id WHERE s.id=?
  `).get(id);
  res.json({ success: true, data: updated });
}

function deleteSubscription(req, res) {
  const db = getDb();
  const r = db.prepare("DELETE FROM subscriptions WHERE id = ?").run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ success: false, message: 'Abonelik bulunamadı.' });
  res.json({ success: true, message: 'Abonelik silindi.' });
}

/* ── User search for dropdown ── */
function searchUsers(req, res) {
  const db = getDb();
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, data: [] });
  const users = db.prepare(
    "SELECT id, first_name, last_name, email FROM users WHERE first_name||' '||last_name||' '||email LIKE ? LIMIT 10"
  ).all(`%${q}%`);
  res.json({ success: true, data: users });
}

module.exports = { stats, listUsers, updateUser, deleteUser, listSubscriptions, createSubscription, updateSubscription, deleteSubscription, searchUsers };
