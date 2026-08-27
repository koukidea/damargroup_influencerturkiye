function slugify(text) {
  const trMap = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u' }
  return String(text ?? '')
    .split('')
    .map((ch) => trMap[ch] ?? ch)
    .join('')
    .toLowerCase()
    .trim()
    // Kesme işaretleri tire yerine tamamen silinir: "Influencer'ı" → "influenceri"
    .replace(/['\u2019\u2018\u02bc]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Yazılar artık kök adreste yayınlanıyor (örn. /yazi-basligi). Bu yüzden bir
// yazı slug'ı sitenin kendi sayfalarından biriyle aynı olamaz — olursa o sayfa
// erişilemez hale gelir. Aşağıdaki adlar rezerve; çakışma olursa "-2" eklenir.
const RESERVED_SLUGS = new Set([
  // React Router sayfaları
  'kaynaklar', 'blog', 'iletisim', 'hizmetlerimiz', 'portfolyo',
  'nasil-calisiyoruz', 'kvkk', 'cerez-politikasi', 'basvuru', 'admin', 'auth',
  'login', 'register',
  // Sunucu / statik dosya yolları
  'api', 'assets', 'portf', 'well-known', 'static', 'public',
  'index', 'index-html', 'sitemap-xml', 'sitemap', 'robots-txt', 'robots',
  'favicon-ico', 'favicon', 'icon', 'icons', 'logo', 'manifest-json', 'manifest',
])

function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(String(slug || '').toLowerCase())
}

// Başlıktan URL'de kullanılabilir, tabloda benzersiz bir slug üretir.
// - Latin harf içermeyen başlıklarda (örn. yalnızca emoji) boş slug yerine `fallback` kullanılır.
// - Aynı slug varsa ya da slug rezerve bir adsa sonuna -2, -3 ... eklenir.
async function uniqueSlug(db, table, title, { excludeId = null, fallback = 'kayit', reserved = false } = {}) {
  const base = slugify(title) || fallback
  let candidate = base

  for (let n = 2; n < 1000; n++) {
    const blocked = reserved && isReservedSlug(candidate)
    if (!blocked) {
      const query = db(table).where({ slug: candidate })
      if (excludeId != null) query.whereNot({ id: excludeId })
      const clash = await query.first()
      if (!clash) return candidate
    }
    candidate = `${base}-${n}`
  }

  return `${base}-${Date.now()}`
}

module.exports = { slugify, uniqueSlug, isReservedSlug, RESERVED_SLUGS }
