import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../lib/api.js'

export const AVATAR_EMOJIS = ['😀', '😎', '🚀', '🔥', '🌟', '🦊', '🐼', '🌈', '🎯', '💼', '📈', '🎬']

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const { user } = await api.get('/auth/me')
        setUser(user)
      } catch {
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  async function register({ name, email, password, avatar }) {
    setError('')
    try {
      const { token, user } = await api.post('/auth/register', {
        name,
        email,
        password,
        avatar,
      })
      setToken(token)
      setUser(user)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  async function login({ email, password }) {
    setError('')
    try {
      const { token, user } = await api.post('/auth/login', { email, password })
      setToken(token)
      setUser(user)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  const value = { user, loading, error, register, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
