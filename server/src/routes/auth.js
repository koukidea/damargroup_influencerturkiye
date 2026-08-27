const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db.js')
const { requireAuth } = require('../middleware/auth.js')
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit.js')

const router = express.Router()

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
}

router.post('/register', registerLimiter, async (req, res) => {
  const { name, email, password, avatar } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Ad, e-posta ve şifre zorunludur.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = await db('users').where({ email: normalizedEmail }).first()
  if (existing) {
    return res.status(409).json({ error: 'Bu e-posta adresiyle zaten bir hesap var.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const [id] = await db('users').insert(
    {
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'user',
      avatar: avatar || '😀',
    },
    ['id']
  )
  const userId = typeof id === 'object' ? id.id : id
  const user = await db('users').where({ id: userId }).first()

  res.status(201).json({ token: signToken(user.id), user: publicUser(user) })
})

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' })
  }
  const normalizedEmail = String(email).trim().toLowerCase()
  const user = await db('users').where({ email: normalizedEmail }).first()
  if (!user) {
    return res.status(401).json({ error: 'E-posta veya şifre hatalı.' })
  }
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'E-posta veya şifre hatalı.' })
  }
  res.json({ token: signToken(user.id), user: publicUser(user) })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

module.exports = router
