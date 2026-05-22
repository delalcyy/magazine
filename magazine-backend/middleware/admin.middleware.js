'use strict';

/**
 * admin.middleware.js
 * authMiddleware'den SONRA zincire eklenir.
 * req.user.role === 'admin' değilse 403 döner.
 * Frontend gizlemesi yeterli değil — her admin route'u bu middleware'i zorunlu kullanır.
 */
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için yetkiniz bulunmamaktadır.'
    });
  }
  next();
}

module.exports = adminMiddleware;
