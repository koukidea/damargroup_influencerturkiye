const express = require('express')
const db = require('../db.js')
const { requireAdmin } = require('../middleware/auth.js')
const { uniqueSlug } = require('../lib/slugify.js')

const router = express.Router()

const STATUSES = ['draft', 'published']
const MAX_LIMIT = 100

// MySQL sürücüsü DATE alanını duruma göre string ya da Date olarak döndürebiliyor.
// <input type="date"> yalnızca YYYY-MM-DD kabul ettiği için tek biçime indiriyoruz.
function toDateString(value) {
  if (!value) return value
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return String(value).slice(0, 10)
}

function toISO(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

// Etiketler tek bir sütunda virgülle saklanıyor; API her zaman dizi konuşur.
function parseTags(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function normalizeTags(value) {
  const list = Array.isArray(value) ? value : parseTags(value)
  const unique = [...new Set(list.map((t) => String(t).trim()).filter(Boolean))]
  return unique.length ? unique.join(', ').slice(0, 500) : null
}

// LIKE kalıbında "%" ve "_" joker karakterdir. Kullanıcı bunları düz metin
// olarak yazdığında (ör. "%50 indirim" ya da tek başına "_") arama tüm yazıları
// eşleştirmesin diye kaçırılıyorlar.
//
// Kaçış karakteri olarak ters bölü yerine "!" seçildi: ters bölü MySQL'de string
// içinde kendisi de kaçış karakteri olduğu için ESCAPE ifadesi iki motorda farklı
// yazılmak zorunda kalırdı ('\\' MySQL, '\' SQLite). "!" ikisinde de olduğu gibi
// geçerlidir.
const LIKE_ESCAPE = '!'

function likePattern(value) {
  const escaped = String(value ?? '')
    .trim()
    .replace(/[!%_]/g, (ch) => `${LIKE_ESCAPE}${ch}`)
  return `%${escaped}%`
}

// Yazının tam metni yalnızca detay isteğinde dönüyor. Liste uçları içeriği
// dışarıda bırakır — aksi halde her sayfa açılışında tüm makaleler indiriliyordu.
function serialize(row, { withContent = false } = {}) {
  const base = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category_slug,
    excerpt: row.excerpt,
    readTime: row.read_time,
    date: toDateString(row.date),
    coverImage: row.cover_image || '',
    coverAlt: row.cover_alt || '',
    author: row.author || '',
    tags: parseTags(row.tags),
    status: row.status || 'published',
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    views: row.views ?? 0,
    updatedAt: toISO(row.updated_at),
    createdAt: toISO(row.created_at),
  }
  return withContent ? { ...base, content: row.content } : base
}

const LIST_COLUMNS = [
  'id', 'slug', 'title', 'category_slug', 'excerpt', 'read_time', 'date',
  'cover_image', 'cover_alt', 'author', 'tags', 'status', 'seo_title',
  'seo_description', 'views', 'updated_at', 'created_at',
]

function isAdmin(req) {
  return req.user?.role === 'admin'
}

async function categoryExists(slug) {
  const row = await db('resource_categories').where({ slug }).first()
  return Boolean(row)
}

function readPayload(body) {
  const {
    title, category, excerpt, readTime, date, content,
    coverImage, coverAlt, author, tags, status, seoTitle, seoDescription,
  } = body || {}

  return {
    title: typeof title === 'string' ? title.trim() : '',
    category: typeof category === 'string' ? category.trim() : '',
    excerpt: typeof excerpt === 'string' ? excerpt.trim() : '',
    readTime: typeof readTime === 'string' ? readTime.trim() : '',
    date: typeof date === 'string' ? date.trim() : '',
    content: typeof content === 'string' ? content : '',
    coverImage: typeof coverImage === 'string' ? coverImage.trim().slice(0, 500) : '',
    coverAlt: typeof coverAlt === 'string' ? coverAlt.trim().slice(0, 255) : '',
    author: typeof author === 'string' ? author.trim().slice(0, 120) : '',
    tags: normalizeTags(tags),
    status: STATUSES.includes(status) ? status : 'published',
    seoTitle: typeof seoTitle === 'string' ? seoTitle.trim().slice(0, 255) : '',
    seoDescription: typeof seoDescription === 'string' ? seoDescription.trim().slice(0, 500) : '',
  }
}

async function validate(payload) {
  if (!payload.title || !payload.category || !payload.excerpt || !payload.content.trim()) {
    return 'Başlık, kategori, özet ve içerik zorunludur.'
  }
  if (!(await categoryExists(payload.category))) {
    return 'Seçilen kategori bulunamadı.'
  }
  if (payload.date && !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    return 'Tarih YYYY-AA-GG biçiminde olmalıdır.'
  }
  return null
}

/* ---------------------------------- Kategoriler --------------------------------- */
// `/:slug` parametreli uçlardan ÖNCE tanımlı olmalı, aksi halde "categories"
// bir yazı slug'ı sanılır.

router.get('/categories', async (req, res) => {
  const rows = await db('resource_categories').select('*').orderBy('position', 'asc')
  res.json(rows)
})

router.post('/categories', requireAdmin, async (req, res) => {
  const { label, icon, color, bg, description } = req.body || {}
  if (!label || !icon || !color || !bg) {
    return res.status(400).json({ error: 'Ad, ikon, renk ve arka plan zorunludur.' })
  }
  const slug = await uniqueSlug(db, 'resource_categories', label, { fallback: 'kategori' })
  const max = await db('resource_categories').max('position as max').first()

  const [id] = await db('resource_categories').insert(
    {
      slug,
      label,
      icon,
      color,
      bg,
      description: typeof description === 'string' ? description.trim().slice(0, 300) || null : null,
      position: (max?.max ?? -1) + 1,
    },
    ['id']
  )
  const insertedId = typeof id === 'object' ? id.id : id
  const row = await db('resource_categories').where({ id: insertedId }).first()
  res.status(201).json(row)
})

router.put('/categories/:id', requireAdmin, async (req, res) => {
  const existing = await db('resource_categories').where({ id: req.params.id }).first()
  if (!existing) return res.status(404).json({ error: 'Kategori bulunamadı.' })

  const { label, icon, color, bg, description } = req.body || {}
  if (!label || !icon || !color || !bg) {
    return res.status(400).json({ error: 'Ad, ikon, renk ve arka plan zorunludur.' })
  }

  // Slug'a dokunulmuyor: kategori adresleri ve yazıların category_slug bağı
  // buna dayanıyor, yeniden adlandırma bağlantıları kırmasın.
  await db('resource_categories')
    .where({ id: req.params.id })
    .update({
      label,
      icon,
      color,
      bg,
      description: typeof description === 'string' ? description.trim().slice(0, 300) || null : null,
    })
  const row = await db('resource_categories').where({ id: req.params.id }).first()
  res.json(row)
})

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  const existing = await db('resource_categories').where({ id: req.params.id }).first()
  if (!existing) return res.status(404).json({ error: 'Kategori bulunamadı.' })

  // Yazısı olan kategori silinirse o yazılar kategorisiz kalır ve liste sayfası
  // onları gösteremez; bu yüzden önce yazıların taşınmasını istiyoruz.
  const [{ count }] = await db('resources')
    .where({ category_slug: existing.slug })
    .count({ count: '*' })
  if (Number(count) > 0) {
    return res.status(400).json({
      error: `Bu kategoride ${count} yazı var. Önce yazıları başka bir kategoriye taşıyın.`,
    })
  }

  await db('resource_categories').where({ id: req.params.id }).del()
  res.status(204).end()
})

/* ------------------------------------ Yazılar ----------------------------------- */

// Ana sayfadaki "Son Yazılar" bölümü için küçük ve sabit maliyetli uç.
router.get('/latest', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 3, 12)
  const rows = await db('resources')
    .select(LIST_COLUMNS)
    .where({ status: 'published' })
    .orderBy([{ column: 'date', order: 'desc' }, { column: 'id', order: 'desc' }])
    .limit(limit)
  res.json(rows.map((row) => serialize(row)))
})

router.get('/', async (req, res) => {
  const { category, q, tag } = req.query
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), MAX_LIMIT)

  // Taslakları yalnızca yönetici görebilir; `status=all` isteği de admin'e özel.
  const requestedStatus = req.query.status
  let statusFilter = 'published'
  if (isAdmin(req) && requestedStatus) {
    statusFilter = requestedStatus === 'all' ? null : requestedStatus
  }

  function applyFilters(query) {
    if (statusFilter) query.where('status', statusFilter)
    if (category) query.where('category_slug', category)
    // Bilerek `whereLike` yerine düz LIKE: knex'in whereLike'ı MySQL'de
    // sorguya `COLLATE utf8_bin` ekliyor. Bu hem aramayı büyük/küçük harfe
    // duyarlı yapar ("ROAS" araması "roas"ı bulamaz) hem de utf8mb4 olan
    // sütunla çakışıp "Illegal mix of collations" hatası verebilir.
    // Düz LIKE, sütunun utf8mb4_unicode_ci ayarını kullanır — Türkçe için doğrusu.
    if (tag) query.whereRaw(`tags LIKE ? ESCAPE '${LIKE_ESCAPE}'`, [likePattern(tag)])
    if (q) {
      const term = likePattern(q)
      query.where((builder) => {
        builder
          .whereRaw(`title LIKE ? ESCAPE '${LIKE_ESCAPE}'`, [term])
          .orWhereRaw(`excerpt LIKE ? ESCAPE '${LIKE_ESCAPE}'`, [term])
          .orWhereRaw(`tags LIKE ? ESCAPE '${LIKE_ESCAPE}'`, [term])
      })
    }
    return query
  }

  const [{ count }] = await applyFilters(db('resources')).count({ count: '*' })
  const total = Number(count)

  // Panel listesi için sıralama seçenekleri. Bilinmeyen değer varsayılana düşer;
  // sütun adları sabit listeden geldiği için sorguya kullanıcı girdisi girmez.
  const SORTS = {
    newest: [{ column: 'date', order: 'desc' }, { column: 'id', order: 'desc' }],
    oldest: [{ column: 'date', order: 'asc' }, { column: 'id', order: 'asc' }],
    views: [{ column: 'views', order: 'desc' }, { column: 'date', order: 'desc' }],
    title: [{ column: 'title', order: 'asc' }],
  }
  const orderBy = SORTS[req.query.sort] || SORTS.newest

  const rows = await applyFilters(db('resources').select(LIST_COLUMNS))
    // Aynı güne düşen yazıların sırası sabit kalsın diye id ile ikincil sıralama.
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit)

  res.json({
    items: rows.map((row) => serialize(row)),
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  })
})

// Okunma sayacı. Ayrı bir uç olmasının sebebi: detay isteği GET ve
// önbelleklenebilir olmalı, yazma işlemi ona karışmamalı.
router.post('/:slug/view', async (req, res) => {
  const updated = await db('resources')
    .where({ slug: req.params.slug, status: 'published' })
    .increment('views', 1)
  if (!updated) return res.status(404).json({ error: 'Bulunamadı.' })
  res.status(204).end()
})

router.get('/:slug', async (req, res) => {
  const row = await db('resources').where({ slug: req.params.slug }).first()
  if (!row) return res.status(404).json({ error: 'Bulunamadı.' })
  // Taslak bir yazının adresi tahmin edilse bile herkese açılmamalı.
  if (row.status !== 'published' && !isAdmin(req)) {
    return res.status(404).json({ error: 'Bulunamadı.' })
  }

  const category = await db('resource_categories').where({ slug: row.category_slug }).first()
  const related = await db('resources')
    .select(LIST_COLUMNS)
    .where({ status: 'published', category_slug: row.category_slug })
    .whereNot({ id: row.id })
    .orderBy([{ column: 'date', order: 'desc' }, { column: 'id', order: 'desc' }])
    .limit(3)

  // Aynı kategoride yazı yoksa "İlgili Yazılar" bölümü boş kalmasın diye
  // en yeni yazılarla tamamlanıyor.
  let fallback = []
  if (related.length < 3) {
    const excludeIds = [row.id, ...related.map((r) => r.id)]
    fallback = await db('resources')
      .select(LIST_COLUMNS)
      .where({ status: 'published' })
      .whereNotIn('id', excludeIds)
      .orderBy([{ column: 'date', order: 'desc' }, { column: 'id', order: 'desc' }])
      .limit(3 - related.length)
  }

  res.json({
    ...serialize(row, { withContent: true }),
    categoryDetail: category || null,
    related: [...related, ...fallback].map((r) => serialize(r)),
  })
})

router.post('/', requireAdmin, async (req, res) => {
  const payload = readPayload(req.body)
  const error = await validate(payload)
  if (error) return res.status(400).json({ error })

  const [id] = await db('resources').insert(
    {
      slug: await uniqueSlug(db, 'resources', payload.title, { fallback: 'yazi', reserved: true }),
      title: payload.title,
      category_slug: payload.category,
      excerpt: payload.excerpt,
      read_time: payload.readTime || '5 dk',
      date: payload.date || new Date().toISOString().slice(0, 10),
      content: payload.content,
      cover_image: payload.coverImage || null,
      cover_alt: payload.coverAlt || null,
      author: payload.author || 'Influencer Türkiye',
      tags: payload.tags,
      status: payload.status,
      seo_title: payload.seoTitle || null,
      seo_description: payload.seoDescription || null,
    },
    ['id']
  )
  const insertedId = typeof id === 'object' ? id.id : id
  const row = await db('resources').where({ id: insertedId }).first()
  res.status(201).json(serialize(row, { withContent: true }))
})

router.put('/:id', requireAdmin, async (req, res) => {
  const existing = await db('resources').where({ id: req.params.id }).first()
  if (!existing) return res.status(404).json({ error: 'Bulunamadı.' })

  const payload = readPayload(req.body)
  const error = await validate(payload)
  if (error) return res.status(400).json({ error })

  // Slug yalnızca başlık gerçekten değiştiğinde yenilenir — aksi halde her
  // kaydetmede yazının adresi değişir ve eski bağlantılar kırılır.
  const slug =
    payload.title === existing.title
      ? existing.slug
      : await uniqueSlug(db, 'resources', payload.title, {
          excludeId: existing.id,
          fallback: 'yazi',
          reserved: true,
        })

  await db('resources')
    .where({ id: req.params.id })
    .update({
      title: payload.title,
      category_slug: payload.category,
      excerpt: payload.excerpt,
      read_time: payload.readTime || existing.read_time,
      date: payload.date || existing.date,
      content: payload.content,
      cover_image: payload.coverImage || null,
      cover_alt: payload.coverAlt || null,
      author: payload.author || existing.author || 'Influencer Türkiye',
      tags: payload.tags,
      status: payload.status,
      seo_title: payload.seoTitle || null,
      seo_description: payload.seoDescription || null,
      updated_at: db.fn.now(),
      slug,
    })
  const row = await db('resources').where({ id: req.params.id }).first()
  res.json(serialize(row, { withContent: true }))
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await db('resources').where({ id: req.params.id }).del()
  if (!deleted) return res.status(404).json({ error: 'Bulunamadı.' })
  res.status(204).end()
})

module.exports = router
