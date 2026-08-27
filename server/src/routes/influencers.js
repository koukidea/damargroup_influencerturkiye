const express = require('express')
const db = require('../db.js')
const { requireAdmin } = require('../middleware/auth.js')

const router = express.Router()

router.get('/', async (req, res) => {
  const rows = await db('influencers').select('*').orderBy('position', 'asc')
  res.json(rows)
})

router.post('/', requireAdmin, async (req, res) => {
  const { name, image, followers, engagement, instagram } = req.body || {}
  if (!name || !image || !followers || !engagement || !instagram) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' })
  }
  const maxPos = await db('influencers').max('position as m').first()
  const [id] = await db('influencers').insert(
    { name, image, followers, engagement, instagram, position: (maxPos?.m ?? -1) + 1 },
    ['id']
  )
  const insertedId = typeof id === 'object' ? id.id : id
  const row = await db('influencers').where({ id: insertedId }).first()
  res.status(201).json(row)
})

router.put('/:id', requireAdmin, async (req, res) => {
  const { name, image, followers, engagement, instagram } = req.body || {}
  if (!name || !image || !followers || !engagement || !instagram) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' })
  }
  // Varlık kontrolü update'in dönüş değerine bırakılmıyor: MySQL bir satırı
  // aynı değerlerle güncellediğinde 0 döndürür ve hiçbir alan değiştirmeden
  // "Kaydet" denildiğinde kayıt dururken "Bulunamadı." hatası verirdi.
  // (SQLite eşleşen satır sayısını döndürdüğü için yerelde görünmüyordu.)
  const existing = await db('influencers').where({ id: req.params.id }).first()
  if (!existing) return res.status(404).json({ error: 'Bulunamadı.' })

  await db('influencers')
    .where({ id: req.params.id })
    .update({ name, image, followers, engagement, instagram })
  const row = await db('influencers').where({ id: req.params.id }).first()
  res.json(row)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await db('influencers').where({ id: req.params.id }).del()
  if (!deleted) return res.status(404).json({ error: 'Bulunamadı.' })
  res.status(204).end()
})

module.exports = router
