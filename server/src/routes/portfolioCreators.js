const express = require('express')
const db = require('../db.js')
const { requireAdmin } = require('../middleware/auth.js')

const router = express.Router()

// Panelde kullanıcı adı alanına "@ad", "instagram.com/ad" ya da tam adres
// yapıştırılması çok olası. Hepsini sade kullanıcı adına indiriyoruz; aksi
// halde galeride "@https://www.instagram.com/ad" gibi etiketler çıkardı.
function normalizeHandle(value) {
  // Baştaki "@" adres ayıklamasından önce atılıyor: "@https://instagram.com/ad"
  // gibi bir yapıştırmada protokol kalıbı aksi hâlde eşleşmez, kullanıcı adı
  // "https:" olarak kaydedilirdi.
  const raw = String(value ?? '').trim().replace(/^@+/, '')
  if (!raw) return ''
  const withoutHost = raw
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^instagram\.com\//i, '')
  return withoutHost.split(/[/?#]/)[0].replace(/^@+/, '').trim()
}

// Instagram alanı boş bırakılırsa adres kullanıcı adından üretilir; panelde
// aynı bilgiyi iki kez yazmak gerekmesin diye.
function resolveFields(body) {
  const handle = normalizeHandle(body?.handle)
  const image = String(body?.image ?? '').trim()
  const instagram =
    String(body?.instagram ?? '').trim() || (handle ? `https://www.instagram.com/${handle}` : '')
  return { handle, image, instagram }
}

router.get('/', async (req, res) => {
  const rows = await db('portfolio_creators').select('*').orderBy('position', 'asc')
  res.json(rows)
})

router.post('/', requireAdmin, async (req, res) => {
  const { handle, image, instagram } = resolveFields(req.body)
  if (!handle || !image) {
    return res.status(400).json({ error: 'Kullanıcı adı ve görsel zorunludur.' })
  }
  const maxPos = await db('portfolio_creators').max('position as m').first()
  const [id] = await db('portfolio_creators').insert(
    { handle, image, instagram, position: (maxPos?.m ?? -1) + 1 },
    ['id']
  )
  const insertedId = typeof id === 'object' ? id.id : id
  const row = await db('portfolio_creators').where({ id: insertedId }).first()
  res.status(201).json(row)
})

router.put('/:id', requireAdmin, async (req, res) => {
  const { handle, image, instagram } = resolveFields(req.body)
  if (!handle || !image) {
    return res.status(400).json({ error: 'Kullanıcı adı ve görsel zorunludur.' })
  }
  // Varlık kontrolü update'in dönüş değerine bırakılmıyor: MySQL bir satırı
  // aynı değerlerle güncellediğinde 0 döndürür ve kayıt duruyorken 404 verirdi.
  const existing = await db('portfolio_creators').where({ id: req.params.id }).first()
  if (!existing) return res.status(404).json({ error: 'Bulunamadı.' })

  await db('portfolio_creators')
    .where({ id: req.params.id })
    .update({ handle, image, instagram })
  const row = await db('portfolio_creators').where({ id: req.params.id }).first()
  res.json(row)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await db('portfolio_creators').where({ id: req.params.id }).del()
  if (!deleted) return res.status(404).json({ error: 'Bulunamadı.' })
  res.status(204).end()
})

module.exports = router
