const jwt = require('jsonwebtoken')
const db = require('../db.js')

async function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    req.user = null
    return next()
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await db('users')
      .select('id', 'name', 'email', 'role', 'avatar')
      .where({ id: payload.sub })
      .first()
    req.user = user || null
  } catch {
    req.user = null
  }
  next()
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' })
  next()
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' })
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Bu işlem için yönetici yetkisi gerekiyor.' })
  }
  next()
}

module.exports = { authenticate, requireAuth, requireAdmin }
