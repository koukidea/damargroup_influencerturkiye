const rateLimit = require('express-rate-limit')

// Acil durum kapısı: reverse proxy gerçek istemci IP'sini iletmiyorsa tüm
// ziyaretçiler tek IP gibi görünür ve limit herkesi engeller. Böyle bir durumda
// .env dosyasına RATE_LIMIT_DISABLED=true yazıp API'yi yeniden başlatmak yeterli.
const disabled = process.env.RATE_LIMIT_DISABLED === 'true'

function createLimiter({ windowMs, limit, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7', // RateLimit-* başlıkları
    legacyHeaders: false,
    skipSuccessfulRequests,
    skip: () => disabled,
    message: { error: message },
  })
}

// Tüm /api trafiği için geniş bir üst sınır. Bir sayfa açılışı ~4 istek attığı
// için 600 istek/15 dk, tek IP'den ~150 sayfa görüntülemeye karşılık gelir;
// normal kullanımı (ve ortak IP arkasındaki ofisleri) etkilemez.
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: 'Çok fazla istek gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin.',
})

// Başarılı girişler sayılmaz (skipSuccessfulRequests), yalnızca başarısız
// denemeler. Böylece şifresini doğru giren kullanıcı hiçbir zaman kilitlenmez.
const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Çok fazla başarısız giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.',
})

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Kısa sürede çok fazla hesap oluşturuldu. Lütfen bir süre sonra tekrar deneyin.',
})

// Başvuru formu herkese açık olduğu için bot spam'ine karşı en dar limit burada.
const applicationLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Kısa sürede çok fazla başvuru gönderildi. Lütfen bir süre sonra tekrar deneyin.',
})

module.exports = { apiLimiter, loginLimiter, registerLimiter, applicationLimiter, disabled }
