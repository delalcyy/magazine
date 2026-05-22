'use strict';

const multer  = require('multer');
const sharp   = require('sharp');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR       = path.join(__dirname, '..', 'uploads', 'casting');
const THUMB_DIR        = path.join(UPLOAD_DIR, 'thumbs');
const ALLOWED_MIMES    = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE    = 8 * 1024 * 1024;   // 8 MB
const MAX_FILES        = 10;
const MAX_DIMENSION    = 2048;               // en uzun kenar
const THUMB_W          = 400;
const THUMB_H          = 500;

/* ── Dizinleri garantile ── */
[UPLOAD_DIR, THUMB_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

/* ── Magic number imzaları ── */
const MAGIC = {
  jpeg: (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  png:  (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47,
  webp: (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
};

function hasMagicNumber(buffer) {
  if (!buffer || buffer.length < 12) return false;
  return MAGIC.jpeg(buffer) || MAGIC.png(buffer) || MAGIC.webp(buffer);
}

/* ── Multer: memory storage, MIME filtresi ── */
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece JPEG, PNG ve WebP görseller kabul edilmektedir.'));
    }
  },
});

/* ── Sharp işleme: magic number + re-encode + resize + thumbnail ── */
async function processUploadedFiles(req, res, next) {
  /* .fields() → object, .array() → array — her ikisini de düzleştir */
  const rawFiles = Array.isArray(req.files)
    ? req.files
    : Object.entries(req.files || {}).flatMap(([fieldname, files]) =>
        files.map(f => ({ ...f, fieldname }))
      );

  if (!rawFiles.length) return next();
  req.files = rawFiles;

  try {
    const processed = [];

    for (const file of rawFiles) {
      /* 1. Magic number kontrolü */
      if (!hasMagicNumber(file.buffer)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz görsel formatı. Dosya içeriği MIME tipiyle eşleşmiyor.'
        });
      }

      /* 2. Görsel boyutunu doğrula */
      const meta = await sharp(file.buffer).metadata();
      if (!meta.width || !meta.height) {
        return res.status(400).json({
          success: false,
          message: 'Görsel okunamadı. Lütfen geçerli bir dosya yükleyin.'
        });
      }

      /* 3. UUID tabanlı isim — orijinal isim hiç kullanılmaz */
      const id        = uuidv4();
      const fileName  = `${id}.jpg`;
      const thumbName = `${id}_thumb.jpg`;
      const filePath  = path.join(UPLOAD_DIR, fileName);
      const thumbPath = path.join(THUMB_DIR,  thumbName);

      /* 4. Re-encode (EXIF sıyrılır, boyut sınırlanır) */
      const mainInfo = await sharp(file.buffer)
        .rotate()                                                   // EXIF orientation düzelt
        .resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(filePath);

      /* 5. Thumbnail */
      await sharp(file.buffer)
        .rotate()
        .resize(THUMB_W, THUMB_H, { fit: 'cover', position: 'top' })
        .jpeg({ quality: 75 })
        .toFile(thumbPath);

      processed.push({
        fieldname:  file.fieldname,
        fileName,
        thumbName,
        mimeType:   'image/jpeg',
        width:      mainInfo.width,
        height:     mainInfo.height,
        sizeBytes:  mainInfo.size,
      });
    }

    req.processedImages = processed;
    next();

  } catch (err) {
    console.error('[upload.processImages]', err.message);
    return res.status(400).json({
      success: false,
      message: 'Görsel işlenemedi. Lütfen geçerli bir görsel yükleyin.'
    });
  }
}

/* ── Multer hata yakalayıcı ── */
function handleMulterError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Dosya boyutu 8 MB sınırını aşıyor.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'En fazla 10 dosya yüklenebilir.' });
    }
    return res.status(400).json({ success: false, message: 'Dosya yükleme hatası.' });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
}

module.exports = {
  multerUpload,
  processUploadedFiles,
  handleMulterError,
  UPLOAD_DIR,
  THUMB_DIR,
};
