const express = require('express')
const db = require('../db.js')

const router = express.Router()

// Sitemap mutlak adres ister. Site ile API aynı alan adındaysa istekten
// türetiriz; farklı alan adı/proxy varsa .env içindeki SITE_URL kazanır.
function siteUrl(req) {
  const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '')
  if (configured) return configured
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https'
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost'
  return `${proto}://${host}`
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toW3CDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

// Yazı dışındaki sabit sayfalar. changefreq/priority Google için bağlayıcı
// değil ama diğer arama motorları hâlâ dikkate alıyor.
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/hizmetlerimiz', changefreq: 'monthly', priority: '0.9' },
  { path: '/kaynaklar', changefreq: 'daily', priority: '0.9' },
  { path: '/portfolyo', changefreq: 'monthly', priority: '0.8' },
  { path: '/iletisim', changefreq: 'yearly', priority: '0.7' },
  { path: '/basvuru', changefreq: 'yearly', priority: '0.6' },
  { path: '/basvuru/influencer', changefreq: 'yearly', priority: '0.6' },
  { path: '/basvuru/marka', changefreq: 'yearly', priority: '0.6' },
  { path: '/kvkk', changefreq: 'yearly', priority: '0.3' },
  { path: '/cerez-politikasi', changefreq: 'yearly', priority: '0.3' },
]

router.get('/sitemap.xml', async (req, res) => {
  const base = siteUrl(req)

  const posts = await db('resources')
    .select('slug', 'date', 'updated_at', 'cover_image', 'title')
    .where({ status: 'published' })
    .orderBy([{ column: 'date', order: 'desc' }, { column: 'id', order: 'desc' }])

  const entries = [
    ...STATIC_PAGES.map((page) => ({
      loc: `${base}${page.path}`,
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod: null,
      image: null,
      title: null,
    })),
    // Yazılar kök adreste yayınlanıyor: /yazi-basligi
    ...posts.map((post) => ({
      loc: `${base}/${post.slug}`,
      changefreq: 'monthly',
      priority: '0.8',
      lastmod: toW3CDate(post.updated_at) || toW3CDate(post.date),
      image: post.cover_image || null,
      title: post.title,
    })),
  ]

  const body = entries
    .map((entry) => {
      const lines = [
        `    <loc>${xmlEscape(entry.loc)}</loc>`,
        entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
      ]
      if (entry.image) {
        const imageUrl = entry.image.startsWith('http') ? entry.image : `${base}${entry.image}`
        lines.push(
          '    <image:image>',
          `      <image:loc>${xmlEscape(imageUrl)}</image:loc>`,
          `      <image:title>${xmlEscape(entry.title || '')}</image:title>`,
          '    </image:image>'
        )
      }
      return `  <url>\n${lines.filter(Boolean).join('\n')}\n  </url>`
    })
    .join('\n')

  res.type('application/xml')
  res.set('Cache-Control', 'public, max-age=3600')
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
      `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`
  )
})

// Tarayıcılar robots.txt'yi YALNIZCA alan adının kökünden okur
// (https://site.com/robots.txt). Bu ucun işe yaraması için Nginx'te
// /robots.txt ve /sitemap.xml adreslerinin buraya yönlendirilmesi gerekir —
// README bölüm 5.3'e bakın. Yönlendirme yoksa bu uç hiçbir arama motoru
// tarafından okunmaz.
router.get('/robots.txt', (req, res) => {
  const base = siteUrl(req)
  res.type('text/plain')
  res.set('Cache-Control', 'public, max-age=3600')
  res.send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /auth/',
      // Sitemap /api altında durduğu için, /api/ yasağından ÖNCE açıkça izin
      // verilmeli. Aksi halde Search Console sitemap'i "robots.txt tarafından
      // engellendi" diye reddeder ve hiç okumaz.
      'Allow: /api/sitemap.xml',
      'Disallow: /api/',
      '',
      // /api/sitemap.xml her koşulda erişilebilir (site zaten /api'yi proxy'liyor).
      // Kökten sunmayı tercih ederseniz README 5.3'teki ikinci Nginx kuralını
      // ekleyip burayı `${base}/sitemap.xml` yapabilirsiniz.
      `Sitemap: ${base}/api/sitemap.xml`,
      '',
    ].join('\n')
  )
})

module.exports = router
