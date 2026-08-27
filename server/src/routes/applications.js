const express = require('express')
const db = require('../db.js')
const { requireAdmin } = require('../middleware/auth.js')
const { applicationLimiter } = require('../middleware/rateLimit.js')
const { sendApplicationMail } = require('../lib/mailer.js')

const router = express.Router()

// Form alanlarının sunucu tarafındaki karşılığı. Tarayıcıdaki `required`
// işaretleri yalnızca kullanıcıya yardım eder; API'ye doğrudan istek atan bir
// bot onları hiç görmez. Bu şema olmadan boş ya da çöp kayıtlar hem başvuru
// listesini kirletir hem de her biri için bildirim maili tetiklerdi.
//
// DİKKAT: Formlara yeni bir alan eklendiğinde buraya da eklenmeli — listede
// olmayan alanlar reddedilir (sessizce düşürülmez ki eksiklik hemen görülsün).
// Üç formda da aynı: KVKK Aydınlatma Metni'nin okunduğuna dair onay kutusu.
// Onay, aydınlatma yükümlülüğünün yerine getirildiğinin ispatı için başvurunun
// kendisiyle birlikte saklanıyor (onay anı için created_at yeterli).
const CONSENT_FIELD = { label: 'KVKK Onayı', required: true, consent: true }

// Onayın hangi metne verildiği sonradan gösterilebilsin diye aydınlatma
// metninin sürümü de kayda yazılıyor. src/pages/KVKKPage.jsx içindeki metin
// değiştiğinde bu tarih de güncellenmeli.
const KVKK_VERSION = '27 Ağustos 2026'

const SCHEMAS = {
  contact: {
    label: 'İletişim formu',
    fields: {
      name: { label: 'Ad Soyad', required: true, max: 120 },
      email: { label: 'E-posta', required: true, max: 160, email: true },
      phone: { label: 'Telefon', required: true, max: 40 },
      subject: { label: 'Konu', max: 120 },
      message: { label: 'Mesaj', required: true, max: 4000 },
      consent: CONSENT_FIELD,
    },
  },
  influencer: {
    label: 'Influencer başvurusu',
    fields: {
      name: { label: 'Ad Soyad', required: true, max: 120 },
      email: { label: 'E-posta', required: true, max: 160, email: true },
      phone: { label: 'Telefon', required: true, max: 40 },
      instagram: { label: 'Instagram', required: true, max: 200 },
      followers: { label: 'Takipçi Sayısı', required: true, max: 40 },
      category: { label: 'Kategori', max: 120 },
      city: { label: 'Şehir', max: 120 },
      message: { label: 'Mesaj', max: 4000 },
      consent: CONSENT_FIELD,
    },
  },
  brand: {
    label: 'Marka başvurusu',
    fields: {
      company: { label: 'Firma', required: true, max: 120 },
      contactName: { label: 'Yetkili Kişi', required: true, max: 120 },
      email: { label: 'E-posta', required: true, max: 160, email: true },
      phone: { label: 'Telefon', required: true, max: 40 },
      sector: { label: 'Sektör', required: true, max: 120 },
      budget: { label: 'Bütçe', max: 120 },
      goal: { label: 'Kampanya Hedefi', max: 120 },
      message: { label: 'Mesaj', max: 4000 },
      consent: CONSENT_FIELD,
    },
  },
}

// Adres doğrulamasında bilerek gevşek bir kalıp: amaç yazım hatasını yakalamak
// değil, "@" bile içermeyen çöp kayıtları elemek. Fazla katı bir kalıp geçerli
// ama alışılmadık adresleri reddedip gerçek başvuruyu kaybettirir.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Formdan gelen her değer düz metin olmalı. Nesne/dizi gelirse String() bunu
// "[object Object]" yapıp sessizce kaydederdi.
function isScalar(value) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

function validate(schema, body) {
  const fields = {}
  const missing = []
  const tooLong = []

  const unknown = Object.keys(body).filter((key) => !schema.fields[key])
  if (unknown.length) {
    return { error: `Tanınmayan alan: ${unknown.join(', ')}` }
  }

  for (const [key, rule] of Object.entries(schema.fields)) {
    const raw = body[key]

    if (raw !== undefined && raw !== null && !isScalar(raw)) {
      return { error: `${rule.label} alanı metin olmalıdır.` }
    }

    const value = raw === undefined || raw === null ? '' : String(raw).trim()

    if (!value) {
      if (rule.required) missing.push(rule.label)
      continue
    }
    // Onay kutusu işaretlenmeden gönderilen başvuru kabul edilmiyor. Kayıtta
    // ham "true" yerine okunabilir bir değer duruyor: başvuru listesi ve
    // bildirim e-postası doğrudan bu değeri gösteriyor.
    if (rule.consent) {
      if (value !== 'true') {
        return { error: 'Başvuruyu göndermek için KVKK Aydınlatma Metni onayı gerekiyor.' }
      }
      fields[key] = 'Onaylandı'
      continue
    }

    if (value.length > rule.max) {
      tooLong.push(`${rule.label} (en fazla ${rule.max} karakter)`)
      continue
    }
    if (rule.email && !EMAIL_PATTERN.test(value)) {
      return { error: 'Geçerli bir e-posta adresi girin.' }
    }

    fields[key] = value
  }

  if (missing.length) {
    return { error: `Şu alanlar zorunlu: ${missing.join(', ')}` }
  }
  if (tooLong.length) {
    return { error: `Şu alanlar çok uzun: ${tooLong.join(', ')}` }
  }

  return { fields }
}

router.post('/', applicationLimiter, async (req, res) => {
  const { type, ...body } = req.body || {}
  const schema = SCHEMAS[type]
  if (!schema) {
    return res.status(400).json({ error: 'Geçersiz başvuru türü.' })
  }

  const { error, fields } = validate(schema, body)
  if (error) return res.status(400).json({ error })

  const record = { ...fields, consentVersion: KVKK_VERSION }

  await db('applications').insert({ type, payload: JSON.stringify(record) })

  // Kayıt veritabanına yazıldıktan sonra bildirim maili gönderilir. Beklemeden
  // yanıt döneriz: SMTP yavaşlarsa ya da düşerse başvuru yine de kaybolmaz.
  sendApplicationMail(type, record).catch((err) =>
    console.error(`Başvuru e-postası gönderilemedi (${type}): ${err.message}`)
  )

  res.status(201).json({ ok: true })
})

router.get('/', requireAdmin, async (req, res) => {
  const rows = await db('applications').select('*').orderBy('created_at', 'desc')
  res.json(
    rows.map((r) => {
      let fields = {}
      try {
        fields = JSON.parse(r.payload)
      } catch {
        fields = { payload: r.payload }
      }
      return { id: r.id, type: r.type, createdAt: r.created_at, ...fields }
    })
  )
})

module.exports = router
