import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSeo } from '../lib/seo.js'

export default function LoginPage() {
  useSeo({ title: 'Giriş Yap', robots: 'noindex, nofollow' })

  const { login, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const redirectTo = location.state?.from || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    const ok = await login(form)
    if (ok) navigate(redirectTo)
  }

  return (
    <section className="bg-white py-16 md:py-24 px-6 min-h-[70vh] flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Hoş Geldiniz
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">Giriş Yap</h1>
          <p className="text-gray-600 mt-2">Hesabınıza giriş yaparak devam edin.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border border-gray-200 rounded-3xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ornek@marka.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="group w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all hover:scale-[1.02]"
          >
            Giriş Yap
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-sm text-gray-500">
            Hesabınız yok mu?{' '}
            <Link to="/auth/register" className="text-red-600 font-medium hover:underline">
              Üye Olun
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
