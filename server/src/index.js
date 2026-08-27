require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { authenticate } = require('./middleware/auth.js')
const { apiLimiter, disabled: rateLimitDisabled } = require('./middleware/rateLimit.js')
const db = require('./db.js')

const authRoutes = require('./routes/auth.js')
const influencerRoutes = require('./routes/influencers.js')
const portfolioCreatorRoutes = require('./routes/portfolioCreators.js')
const serviceRoutes = require('./routes/services.js')
const resourceRoutes = require('./routes/resources.js')
const applicationRoutes = require('./routes/applications.js')
const seoRoutes = require('./routes/seo.js')

const isProduction = process.env.NODE_ENV === 'production'

// Zayıf/eksik JWT_SECRET ile canlıya çıkmayı engelle — aksi halde girişler
// çalışıyor gibi görünüp token'lar tahmin edilebilir olurdu.
if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me')) {
  console.error(
    'HATA: .env dosyasında JWT_SECRET tanımlı değil veya hâlâ "change-me". ' +
      'Yeni bir değer üretin:\n' +
      '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  )
  process.exit(1)
}

const app = express()

// aaPanel/Nginx reverse proxy arkasında gerçek istemci IP'sini görebilmek için.
// Hız sınırı bu değere dayanır: yanlışsa tüm ziyaretçiler tek IP gibi sayılır.
// Zincirde birden fazla proxy varsa (örn. Cloudflare + Nginx) TRUST_PROXY=2 yapın.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1))

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  })
)
// Sağlık kontrolü hız sınırının dışında tutulur (izleme araçları engellenmesin).
// Dönen `ip` alanı, reverse proxy'nin gerçek istemci IP'sini iletip iletmediğini
// doğrulamak içindir: burada 127.0.0.1 görüyorsanız proxy yapılandırması eksiktir.
app.get('/api/health', (req, res) => res.json({ ok: true, ip: req.ip }))

app.use('/api', apiLimiter)
app.use(express.json())
app.use(authenticate)

app.use('/api/auth', authRoutes)
app.use('/api/influencers', influencerRoutes)
app.use('/api/portfolio-creators', portfolioCreatorRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/applications', applicationRoutes)
// /api/sitemap.xml ve /api/robots.txt — arama motorlarına yazı adreslerini bildirir.
app.use('/api', seoRoutes)

app.use((req, res) => res.status(404).json({ error: 'Bulunamadı.' }))

// Veritabanı kısıt hatalarını, kullanıcıya "Sunucu hatası." demek yerine
// anlaşılır mesaja çevirir (SQLite ve MySQL kodlarının ikisini de kapsar).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)

  const code = err.code || ''
  if (code === 'ER_DUP_ENTRY' || code.startsWith('SQLITE_CONSTRAINT_UNIQUE')) {
    return res.status(409).json({ error: 'Bu kayıt zaten mevcut.' })
  }
  if (
    code === 'ER_NO_REFERENCED_ROW' ||
    code === 'ER_NO_REFERENCED_ROW_2' ||
    code.startsWith('SQLITE_CONSTRAINT_FOREIGNKEY')
  ) {
    return res.status(400).json({ error: 'Seçilen ilişkili kayıt bulunamadı.' })
  }
  if (code === 'ER_DATA_TOO_LONG' || code === 'ER_TRUNCATED_WRONG_VALUE') {
    return res.status(400).json({ error: 'Girilen değer bu alan için çok uzun veya geçersiz.' })
  }
  if (code === 'ECONNREFUSED' || code === 'PROTOCOL_CONNECTION_LOST' || code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ error: 'Veritabanına bağlanılamıyor.' })
  }

  res.status(500).json({ error: 'Sunucu hatası.' })
})

// Bağlanılan veritabanını şifre hariç tek satırda özetler.
function describeDatabase() {
  const { client, connection } = db.client.config
  if (client === 'mysql2') {
    return `mysql2 → ${connection.user}@${connection.host}:${connection.port}/${connection.database}`
  }
  return `${client} → ${connection.filename}`
}

// Bağlantıyı açılışta bir kez sınar. Yanlış .env ile başlatıldığında sorunun
// ilk ziyaretçi isteğinde değil, burada görülmesi için.
function reportDatabase() {
  const label = describeDatabase()
  db.raw('select 1')
    .then(() => console.log(`Veritabanı bağlantısı hazır: ${label}`))
    .catch((err) => {
      console.error(`HATA: Veritabanına bağlanılamadı — ${label}`)
      console.error(`  ${err.message}`)
    })
}

const port = process.env.PORT || 4000
// Reverse proxy arkasında sadece localhost'u dinle; portun dışarı açılmasını önler.
const host = process.env.HOST || '127.0.0.1'
app.listen(port, host, () => {
  console.log(`API http://${host}:${port} adresinde çalışıyor`)
  if (rateLimitDisabled) {
    console.warn('UYARI: RATE_LIMIT_DISABLED=true — hız sınırı kapalı.')
  }
  reportDatabase()
})
