const nodemailer = require('nodemailer')

// Başvuru türüne göre bildirim adresi. .env'den değiştirilebilir; boş bırakılırsa
// aşağıdaki varsayılanlar kullanılır.
const RECIPIENTS = {
  brand: process.env.MAIL_TO_BRAND || 'customer@influencerturkiye.com',
  influencer: process.env.MAIL_TO_INFLUENCER || 'influencer@influencerturkiye.com',
  contact: process.env.MAIL_TO_CONTACT || 'hello@influencerturkiye.com',
}

const TYPE_LABELS = {
  brand: 'Marka Başvurusu',
  influencer: 'Influencer Başvurusu',
  contact: 'İletişim Formu',
}

// Form alan adlarının e-postada görünecek Türkçe karşılıkları. Listede olmayan
// bir alan gelirse ham adıyla yazılır — yeni alan eklendiğinde mail bozulmaz.
const FIELD_LABELS = {
  name: 'Ad Soyad',
  contactName: 'Yetkili Kişi',
  company: 'Firma',
  email: 'E-posta',
  phone: 'Telefon',
  instagram: 'Instagram',
  followers: 'Takipçi Sayısı',
  category: 'Kategori',
  city: 'Şehir',
  sector: 'Sektör',
  budget: 'Bütçe',
  goal: 'Kampanya Hedefi',
  subject: 'Konu',
  message: 'Mesaj',
  consent: 'KVKK Onayı',
  consentVersion: 'Onaylanan Aydınlatma Metni Sürümü',
}

const host = process.env.SMTP_HOST
const enabled = Boolean(host)

let transporter = null
if (enabled) {
  const port = Number(process.env.SMTP_PORT || 465)
  transporter = nodemailer.createTransport({
    host,
    port,
    // 465 → örtük TLS, 587 → STARTTLS. SMTP_SECURE ile elle de belirtilebilir.
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function labelFor(key) {
  return FIELD_LABELS[key] || key
}

function buildBody(type, fields) {
  const entries = Object.entries(fields).filter(
    ([, value]) => value !== undefined && value !== null && String(value).trim() !== ''
  )

  const text = entries.map(([key, value]) => `${labelFor(key)}: ${value}`).join('\n')

  const rows = entries
    .map(
      ([key, value]) =>
        `<tr>` +
        `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;white-space:nowrap;vertical-align:top">${escapeHtml(
          labelFor(key)
        )}</td>` +
        `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111">${escapeHtml(
          value
        ).replace(/\n/g, '<br>')}</td>` +
        `</tr>`
    )
    .join('')

  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px">` +
    `<h2 style="margin:0 0 16px">${escapeHtml(TYPE_LABELS[type] || type)}</h2>` +
    `<table style="border-collapse:collapse;min-width:420px">${rows}</table>` +
    `<p style="margin-top:16px;color:#888;font-size:12px">Bu e-posta influencerturkiye.com üzerindeki form tarafından otomatik gönderildi.</p>` +
    `</div>`

  return { text, html }
}

// Başvuru bildirimi gönderir. Bilerek "fire and forget": SMTP çökse bile
// ziyaretçinin başvurusu veritabanına yazılmış olur, hata yalnızca loglanır.
async function sendApplicationMail(type, fields) {
  if (!enabled) return

  const to = RECIPIENTS[type]
  if (!to) return

  const { text, html } = buildBody(type, fields)
  const who = fields.company || fields.name || fields.contactName || fields.email || ''
  const subject = `${TYPE_LABELS[type] || type}${who ? ` — ${who}` : ''}`

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      // Ekip doğrudan "Yanıtla" ile başvurana dönebilsin.
      replyTo: fields.email || undefined,
    })
  } catch (err) {
    console.error(`Başvuru e-postası gönderilemedi (${type} → ${to}): ${err.message}`)
  }
}

module.exports = { sendApplicationMail, RECIPIENTS, mailEnabled: enabled }
