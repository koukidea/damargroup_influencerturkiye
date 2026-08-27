import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api.js'
import { useSeo } from '../lib/seo.js'

const categories = [
  'Sanat & Life Style',
  'Moda & Tasarım',
  'Beauty',
  'Seyahat',
  'Yemek',
  'Spor & Fitness',
  'Teknoloji',
  'Diğer',
]

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  instagram: '',
  followers: '',
  category: categories[0],
  city: '',
  message: '',
}

export default function InfluencerApplicationPage() {
  useSeo({
    title: 'Influencer Başvurusu',
    description:
      "Influencer Türkiye ağına katılın: marka işbirlikleri, kampanya fırsatları ve profesyonel yönetim.",
    canonical: '/basvuru/influencer',
  })

  const [form, setForm] = useState(emptyForm)
  // Onay kutusunun durumu başvuruyla birlikte kaydediliyor: aydınlatma
  // yükümlülüğünün yerine getirildiği sonradan bu kayıttan gösteriliyor.
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleChange(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    try {
      await api.post('/applications', { type: 'influencer', ...form, consent })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message)
    }
  }

  if (submitted) {
    return (
      <section className="bg-white py-16 md:py-24 px-6 min-h-[70vh] flex items-center">
        <div className="max-w-md mx-auto w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Başvurunuz Alındı!</h1>
          <p className="text-gray-600 mb-8">
            {form.name.split(' ')[0]}, başvurunuzu inceleyip en kısa sürede size dönüş
            yapacağız.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all"
          >
            Anasayfaya Dön
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-16 md:py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/basvuru"
          className="flex w-fit items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Başvuru Türünü Değiştir
        </Link>

        <span className="block text-red-600 text-sm font-semibold tracking-wider uppercase">
          Influencer Başvuru
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">
          Portföyümüze Katılın
        </h1>
        <p className="text-gray-600 mb-10">
          Aşağıdaki formu doldurun, ekibimiz sizinle iletişime geçsin.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border border-gray-200 rounded-3xl p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Ad Soyad" required>
              <input
                type="text"
                required
                value={form.name}
                onChange={handleChange('name')}
                className="input"
                placeholder="Adınız Soyadınız"
              />
            </Field>
            <Field label="E-posta" required>
              <input
                type="email"
                required
                value={form.email}
                onChange={handleChange('email')}
                className="input"
                placeholder="ornek@mail.com"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Telefon" required>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={handleChange('phone')}
                className="input"
                placeholder="0 (5XX) XXX XX XX"
              />
            </Field>
            <Field label="Şehir">
              <input
                type="text"
                value={form.city}
                onChange={handleChange('city')}
                className="input"
                placeholder="İstanbul"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Instagram / TikTok Kullanıcı Adı" required>
              <input
                type="text"
                required
                value={form.instagram}
                onChange={handleChange('instagram')}
                className="input"
                placeholder="@kullaniciadi"
              />
            </Field>
            <Field label="Toplam Takipçi Sayısı" required>
              <input
                type="text"
                required
                value={form.followers}
                onChange={handleChange('followers')}
                className="input"
                placeholder="ör. 50K"
              />
            </Field>
          </div>

          <Field label="İçerik Kategoriniz">
            <select value={form.category} onChange={handleChange('category')} className="input">
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Kendinizden Bahsedin">
            <textarea
              rows={4}
              maxLength={4000}
              value={form.message}
              onChange={handleChange('message')}
              className="input resize-none"
              placeholder="İçerik tarzınız, geçmiş işbirlikleriniz vb."
            />
          </Field>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500/30"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              Paylaştığım bilgilerin başvurumun değerlendirilmesi amacıyla işlenmesini kabul
              ediyorum.{' '}
              <Link to="/kvkk" className="text-red-600 hover:underline font-medium">
                KVKK Aydınlatma Metni
              </Link>
            </span>
          </label>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="group w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all hover:scale-[1.02]"
          >
            Başvuruyu Gönder
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </section>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}
