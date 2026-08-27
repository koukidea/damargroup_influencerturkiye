const express = require('express')
const db = require('../db.js')
const { requireAdmin } = require('../middleware/auth.js')
const { uniqueSlug } = require('../lib/slugify.js')

const router = express.Router()

async function attachItems(services) {
  if (services.length === 0) return []
  const ids = services.map((s) => s.id)
  const items = await db('service_items')
    .whereIn('service_id', ids)
    .orderBy('position', 'asc')
  return services.map((s) => ({
    ...s,
    items: items.filter((i) => i.service_id === s.id).map((i) => i.text),
  }))
}

router.get('/', async (req, res) => {
  const services = await db('services').select('*').orderBy('position', 'asc')
  res.json(await attachItems(services))
})

router.post('/', requireAdmin, async (req, res) => {
  const { title, description, icon, items } = req.body || {}
  if (!title || !description || !icon) {
    return res.status(400).json({ error: 'Başlık, açıklama ve ikon zorunludur.' })
  }
  const maxPos = await db('services').max('position as m').first()
  const [id] = await db('services').insert(
    {
      slug: await uniqueSlug(db, 'services', title, { fallback: 'hizmet' }),
      title,
      description,
      icon,
      position: (maxPos?.m ?? -1) + 1,
    },
    ['id']
  )
  const serviceId = typeof id === 'object' ? id.id : id
  const itemList = Array.isArray(items) ? items : []
  if (itemList.length) {
    await db('service_items').insert(
      itemList.map((text, i) => ({ service_id: serviceId, text, position: i }))
    )
  }
  const [row] = await attachItems([await db('services').where({ id: serviceId }).first()])
  res.status(201).json(row)
})

router.put('/:id', requireAdmin, async (req, res) => {
  const { title, description, icon, items } = req.body || {}
  const existing = await db('services').where({ id: req.params.id }).first()
  if (!existing) return res.status(404).json({ error: 'Bulunamadı.' })

  if (!title || !description || !icon) {
    return res.status(400).json({ error: 'Başlık, açıklama ve ikon zorunludur.' })
  }

  // Slug yalnızca başlık gerçekten değiştiğinde yenilenir.
  const slug =
    title === existing.title
      ? existing.slug
      : await uniqueSlug(db, 'services', title, { excludeId: existing.id, fallback: 'hizmet' })

  await db('services')
    .where({ id: req.params.id })
    .update({ title, description, icon, slug })

  await db('service_items').where({ service_id: req.params.id }).del()
  const itemList = Array.isArray(items) ? items : []
  if (itemList.length) {
    await db('service_items').insert(
      itemList.map((text, i) => ({ service_id: req.params.id, text, position: i }))
    )
  }

  const [row] = await attachItems([await db('services').where({ id: req.params.id }).first()])
  res.json(row)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await db('services').where({ id: req.params.id }).del()
  if (!deleted) return res.status(404).json({ error: 'Bulunamadı.' })
  res.status(204).end()
})

module.exports = router
