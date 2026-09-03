const path = require('path')
const fs = require('fs/promises')
const crypto = require('crypto')
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { requireAdmin } = require('../middleware/auth.js')

// Panelden yüklenen görseller. Dosyalar build çıktısına (dist/) değil, API'nin
// kendi klasörüne yazılıyor; böylece her yeni build'de silinmiyor ve Nginx'te
// ek ayar gerekmiyor — /api zaten Express'e gidiyor, görseller de /api/uploads
// altından servis ediliyor.
const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads')
)
const PUBLIC_PREFIX = '/api/uploads'

// Kart görselleri en fazla ~300px genişlikte gösteriliyor; retina için 2 kat
// yeterli. Daha büyük dosyalar sadece bant genişliği harcar.
const MAX_WIDTH = 1200
const MAX_HEIGHT = 1600
const WEBP_QUALITY = 82
const MAX_FILE_BYTES = 20 * 1024 * 1024

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true)
    cb(new UploadError('Yalnızca görsel dosyaları yüklenebilir (JPG, PNG, WebP, GIF, AVIF, HEIC).'))
  },
})

class UploadError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

// Dosya adı Türkçe karakter ve boşluk içerebilir; URL'de sorun çıkmasın diye
// sadeleştiriliyor. Rastgele ek, aynı isimle ikinci yüklemenin eskisinin
// üstüne yazmasını ve tarayıcı/Cloudflare önbelleğinin eski görseli
// göstermeye devam etmesini engelliyor.
// multer dosya adını latin1 olarak çözüyor; tarayıcının UTF-8 gönderdiği
// "Fotoğraf" burada "FotoÄŸraf" olarak gelir. Tüm karakterler tek bayt
// aralığındaysa geri çevriliyor (ASCII adlar için sonuç aynı kalır).
function decodeOriginalName(name) {
  const value = String(name || '')
  if (![...value].every((ch) => ch.charCodeAt(0) <= 0xff)) return value
  const decoded = Buffer.from(value, 'latin1').toString('utf8')
  return decoded.includes('\uFFFD') ? value : decoded
}

function safeBaseName(rawName) {
  const originalName = decodeOriginalName(rawName)
  const base = path.basename(originalName || 'gorsel', path.extname(originalName || ''))
  // macOS dosya adlarını ayrık (NFD) unicode ile gönderir: "ğ" aslında "g" +
  // ayrı bir işaret. Önce birleştirip Türkçe harfleri çevirmek, sonra kalan
  // aksanları atmak gerekiyor; yoksa "fotoğraf" → "foto-raf" olurdu.
  const slug = base
    .normalize('NFC')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return slug || 'gorsel'
}

function isUploadedUrl(url) {
  return typeof url === 'string' && url.startsWith(`${PUBLIC_PREFIX}/`)
}

// Bir kayıt silindiğinde ya da görseli değiştirildiğinde eski dosyayı kaldırır.
// Yalnızca bu API'nin yüklediği dosyalar (/api/uploads/...) silinir; elle
// girilen /portf/... yolları ya da dış adresler dokunulmadan bırakılır.
async function removeUploadedFile(url) {
  if (!isUploadedUrl(url)) return
  const name = path.basename(url)
  if (!/^[a-z0-9-]+\.webp$/.test(name)) return
  await fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => {})
}

const router = express.Router()

router.post('/', requireAdmin, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Dosya çok büyük. En fazla 20 MB yükleyebilirsiniz.' })
      }
      if (err instanceof UploadError) return res.status(err.status).json({ error: err.message })
      return next(err)
    }
    if (!req.file) return res.status(400).json({ error: 'Yüklenecek dosya bulunamadı.' })

    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })

      const fileName = `${safeBaseName(req.file.originalname)}-${crypto
        .randomBytes(4)
        .toString('hex')}.webp`

      const image = sharp(req.file.buffer, { animated: false }).rotate()
      const { width, height } = await image
        .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(path.join(UPLOAD_DIR, fileName))

      res.status(201).json({ url: `${PUBLIC_PREFIX}/${fileName}`, width, height })
    } catch (error) {
      console.error(error)
      res.status(400).json({ error: 'Görsel işlenemedi. Dosya bozuk ya da desteklenmeyen bir biçimde olabilir.' })
    }
  })
})

// Yüklenen dosyalar. Adlar rastgele ek taşıdığı için içerik hiç değişmez;
// bir yıl önbelleklenebilir.
const staticHandler = express.static(UPLOAD_DIR, {
  maxAge: '365d',
  immutable: true,
  index: false,
})

module.exports = { router, staticHandler, removeUploadedFile, isUploadedUrl, UPLOAD_DIR }
