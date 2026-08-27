// SMTP ayarlarını canlıya çıkmadan doğrular.
//
//   npm run mail:test                       → bağlantı + kimlik doğrulama testi
//   npm run mail:test -- ornek@adres.com    → ek olarak gerçek bir test maili yollar
//
// .env içindeki SMTP_* değerlerini olduğu gibi kullanır; hiçbir şeyi değiştirmez.
require('dotenv').config()
const nodemailer = require('nodemailer')

const host = process.env.SMTP_HOST
if (!host) {
  console.error('SMTP_HOST boş — mail gönderimi kapalı. .env dosyasını doldurun.')
  process.exit(1)
}

const port = Number(process.env.SMTP_PORT || 465)
const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465
const from = process.env.MAIL_FROM || process.env.SMTP_USER

console.log('Sunucu   :', `${host}:${port}`)
console.log('Şifreleme:', secure ? 'örtük TLS (SMTPS)' : 'STARTTLS')
console.log('Kullanıcı:', process.env.SMTP_USER || '(kimlik doğrulama yok)')
console.log('Gönderen :', from)

if (process.env.SMTP_USER && from && process.env.SMTP_USER !== from) {
  console.warn(
    `\nUYARI: MAIL_FROM (${from}) ile SMTP_USER (${process.env.SMTP_USER}) farklı.\n` +
      'Çoğu sunucu bunu reddeder veya mail spam klasörüne düşer. Aynı adresi kullanın.'
  )
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
  connectionTimeout: 15000,
})

async function main() {
  process.stdout.write('\nBağlantı ve kimlik doğrulama... ')
  await transporter.verify()
  console.log('BAŞARILI')

  const to = process.argv[2]
  if (!to) {
    console.log('\nGerçek bir test maili için: npm run mail:test -- kendi@adresiniz.com')
    return
  }

  process.stdout.write(`${to} adresine test maili gönderiliyor... `)
  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Influencer Türkiye — SMTP test',
    text: 'Bu bir testtir. Bunu okuyabiliyorsanız form bildirimleri çalışacak.',
  })
  console.log('GÖNDERİLDİ')
  console.log('Sunucu yanıtı:', info.response)
  console.log('\nGelen kutusunda görünmüyorsa spam klasörüne bakın (SPF/DKIM sorunu).')
}

main()
  .catch((err) => {
    console.log('BAŞARISIZ\n')
    console.error('Hata:', err.message)
    const hints = {
      EAUTH: 'Kullanıcı adı veya şifre yanlış. SMTP_USER tam e-posta adresi olmalı.',
      ETIMEDOUT: 'Sunucuya ulaşılamadı. SMTP_HOST Cloudflare arkasında olabilir veya port kapalı.',
      ECONNECTION: 'Bağlantı kurulamadı. Host/port doğru mu, sunucu güvenlik duvarı açık mı?',
      ESOCKET:
        'TLS sorunu. Hata "does not match certificate" diyorsa SMTP_HOST kendi alan adınız ' +
        'yerine hosting firmanızın sunucu adı olmalı (ör. mail.guzelhosting.com). ' +
        'Değilse port/şifreleme uyuşmuyor: 465 → true, 587 → false.',
      EENVELOPE: 'Gönderen veya alıcı adresi reddedildi. MAIL_FROM gerçek bir kutu mu?',
    }
    if (hints[err.code]) console.error('Olası neden:', hints[err.code])
    process.exit(1)
  })
  .finally(() => transporter.close())
