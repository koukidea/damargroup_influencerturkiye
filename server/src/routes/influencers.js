const express = require('express')
const db = require('../db.js')
const { requireAdmin } = require('../middleware/auth.js')
const { normalizeHandle } = require('../lib/handle.js')
const { removeUploadedFile } = require('./uploads.js')

const router = express.Router()

// Tek tablo iki sayfayı besliyor: anasayfa kart slider'ı (show_on_home) ve
// portföy sayfasındaki galeri (show_in_portfolio). Takipçi/etkileşim yalnızca
// anasayfa kartında gösterildiği için sadece o seçiliyken zorunlu.

function toBool(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') return ['1', 'true', 'on', 'yes'].includes(value.toLowerCase())
  return false
}

// SQLite boolean'ı 0/1 döndürür; istemci tarafında `inf.show_on_home === true`
// gibi karşılaştırmalar şaşırmasın diye yanıtta gerçek boolean'a çevriliyor.
function serialize(row) {
  return {
    ...row,
    show_on_home: toBool(row.show_on_home),
    show_in_portfolio: toBool(row.show_in_portfolio),
  }
}

function resolveFields(body) {
  const src = body || {}
  const instagramRaw = String(src.instagram ?? '').trim()
  const handle = normalizeHandle(src.handle || instagramRaw)
  // Alana tam adres yerine "@ad" ya da "instagram.com/ad" yazılmış olabilir;
  // link yalnızca gerçek bir adres girildiyse olduğu gibi saklanır, aksi hâlde
  // kullanıcı adından üretilir. Yoksa kartlardaki bağlantı "@ad" olurdu.
  const instagram = /^https?:\/\//i.test(instagramRaw)
    ? instagramRaw
    : handle
      ? `https://www.instagram.com/${handle}`
      : ''
  const name = String(src.name ?? '').trim() || handle
  const show_on_home = toBool(src.show_on_home)
  const show_in_portfolio = toBool(src.show_in_portfolio)

  return {
    name,
    handle,
    image: String(src.image ?? '').trim(),
    followers: String(src.followers ?? '').trim(),
    engagement: String(src.engagement ?? '').trim(),
    instagram,
    show_on_home,
    show_in_portfolio,
  }
}

function validate(fields) {
  if (!fields.name) return 'İsim zorunludur.'
  if (!fields.image) return 'Görsel zorunludur.'
  if (!fields.handle) return 'Instagram kullanıcı adı veya linki zorunludur.'
  if (!fields.show_on_home && !fields.show_in_portfolio) {
    return 'Influencer en az bir sayfada gösterilmeli (anasayfa veya portföy).'
  }
  if (fields.show_on_home && (!fields.followers || !fields.engagement)) {
    return 'Anasayfa kartı için takipçi sayısı ve etkileşim oranı zorunludur.'
  }
  return null
}

router.get('/', async (req, res) => {
  const rows = await db('influencers').select('*').orderBy('position', 'asc')
  res.json(rows.map(serialize))
})

router.post('/', requireAdmin, async (req, res) => {
  const fields = resolveFields(req.body)
  const error = validate(fields)
  if (error) return res.status(400).json({ error })

  const maxPos = await db('influencers').max('position as m').first()
  const [id] = await db('influencers').insert(
    { ...fields, position: (maxPos?.m ?? -1) + 1 },
    ['id']
  )
  const insertedId = typeof id === 'object' ? id.id : id
  const row = await db('influencers').where({ id: insertedId }).first()
  res.status(201).json(serialize(row))
})

// Sıralama: panelden gönderilen id listesi yeni sırayı belirler.
router.put('/reorder', requireAdmin, async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : []
  if (!ids.length || ids.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ error: 'Geçersiz sıralama.' })
  }
  await db.transaction(async (trx) => {
    for (let i = 0; i < ids.length; i++) {
      await trx('influencers').where({ id: ids[i] }).update({ position: i })
    }
  })
  const rows = await db('influencers').select('*').orderBy('position', 'asc')
  res.json(rows.map(serialize))
})

router.put('/:id', requireAdmin, async (req, res) => {
  const fields = resolveFields(req.body)
  const error = validate(fields)
  if (error) return res.status(400).json({ error })

  // Varlık kontrolü update'in dönüş değerine bırakılmıyor: MySQL bir satırı
  // aynı değerlerle güncellediğinde 0 döndürür ve hiçbir alan değiştirmeden
  // "Kaydet" denildiğinde kayıt dururken "Bulunamadı." hatası verirdi.
  // (SQLite eşleşen satır sayısını döndürdüğü için yerelde görünmüyordu.)
  const existing = await db('influencers').where({ id: req.params.id }).first()
  if (!existing) return res.status(404).json({ error: 'Bulunamadı.' })

  await db('influencers').where({ id: req.params.id }).update(fields)
  const row = await db('influencers').where({ id: req.params.id }).first()

  // Görsel değiştiyse eski yüklenmiş dosya boşuna yer kaplamasın.
  if (existing.image !== fields.image) await cleanupImage(existing.image)

  res.json(serialize(row))
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const existing = await db('influencers').where({ id: req.params.id }).first()
  if (!existing) return res.status(404).json({ error: 'Bulunamadı.' })
  await db('influencers').where({ id: req.params.id }).del()
  await cleanupImage(existing.image)
  res.status(204).end()
})

// Aynı dosyayı başka bir kayıt da kullanıyorsa (nadir ama mümkün) silme.
async function cleanupImage(image) {
  if (!image) return
  const stillUsed = await db('influencers').where({ image }).first()
  if (!stillUsed) await removeUploadedFile(image)
}

module.exports = router
