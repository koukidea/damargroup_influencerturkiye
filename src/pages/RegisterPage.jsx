import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth, AVATAR_EMOJIS } from '../context/AuthContext.jsx'
import { useSeo } from '../lib/seo.js'

// Üyelik alımı şu anda kapalı. Formun tasarımı olduğu gibi duruyor, yalnızca
// gönderim devre dışı. Yeniden açmak için bu değeri true yapmak yeterli.
const REGISTRATION_ENABLED = false

export default function RegisterPage() {
  useSeo({ title: 'Kayıt Ol', robots: 'noindex, nofollow' })

  const { register, error } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    avatar: AVATAR_EMOJIS[0],
  })

  async function handleSubmit(e) {
    e.preventDefault()
    // Buton disabled olsa da alanlarda Enter'a basmak formu gönderebilir.
    if (!REGISTRATION_ENABLED) return
    const ok = await register(form)
    if (ok) navigate('/')
  }

  return (
    <section className="bg-white py-16 md:py-24 px-6 min-h-[70vh] flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Aramıza Katılın
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">Üye Ol</h1>
          <p className="text-gray-600 mt-2">
            Ücretsiz hesap oluşturun, birkaç saniye sürer.
          </p>
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
              Ad Soyad
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Adınız Soyadınız"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
              />
            </div>
          </div>

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
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="En az 6 karakter"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bir avatar seçin
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setForm({ ...form, avatar: emoji })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                    form.avatar === emoji
                      ? 'border-red-600 bg-red-50 scale-110'
                      : 'border-gray-200 bg-white hover:border-red-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!REGISTRATION_ENABLED}
            className={`group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all ${
              REGISTRATION_ENABLED
                ? 'bg-red-600 hover:bg-red-700 text-white hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Üye Ol
            <ArrowRight
              className={`w-4 h-4 transition-transform ${
                REGISTRATION_ENABLED ? 'group-hover:translate-x-1' : ''
              }`}
            />
          </button>

          <p className="text-center text-sm text-gray-500">
            Zaten hesabınız var mı?{' '}
            <Link to="/auth/login" className="text-red-600 font-medium hover:underline">
              Giriş Yapın
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
