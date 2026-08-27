import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api.js'
import { useSeo } from '../lib/seo.js'

const budgetRanges = [
  '10.000 - 25.000 TL',
  '25.000 - 50.000 TL',
  '50.000 - 100.000 TL',
  '100.000 TL ve üzeri',
]

const goals = [
  'Marka Bilinirliği',
  'Satış / Dönüşüm',
  'Ürün Lansmanı',
  'Etkinlik Tanıtımı',
  'Diğer',
]

const emptyForm = {
  company: '',
  contactName: '',
  email: '',
  phone: '',
  sector: '',
  budget: budgetRanges[0],
  goal: goals[0],
  message: '',
}

export default function BrandApplicationPage() {
  useSeo({
    title: 'Marka Başvurusu',
    description:
      "Markanız için doğru influencer'ları bulalım. Kampanya ihtiyacınızı iletin, ekibimiz size dönsün.",
    canonical: '/basvuru/marka',
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
      await api.post('/applications', { type: 'brand', ...form, consent })
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
            {form.company}, talebinizi inceleyip en kısa sürede size dönüş yapacağız.
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
          Marka Başvuru
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">
          Kampanyanız İçin Bize Ulaşın
        </h1>
        <p className="text-gray-600 mb-10">
          Aşağıdaki formu doldurun, ihtiyacınıza uygun influencer portföyünü birlikte
          belirleyelim.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border border-gray-200 rounded-3xl p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Firma Adı" required>
              <input
                type="text"
                required
                value={form.company}
                onChange={handleChange('company')}
                className="input"
                placeholder="Firma / Marka Adı"
              />
            </Field>
            <Field label="Yetkili Adı Soyadı" required>
              <input
                type="text"
                required
                value={form.contactName}
                onChange={handleChange('contactName')}
                className="input"
                placeholder="Adınız Soyadınız"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="E-posta" required>
              <input
                type="email"
                required
                value={form.email}
                onChange={handleChange('email')}
                className="input"
                placeholder="ornek@marka.com"
              />
            </Field>
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
          </div>

          <Field label="Sektör" required>
            <input
              type="text"
              required
              value={form.sector}
              onChange={handleChange('sector')}
              className="input"
              placeholder="ör. E-ticaret, Kozmetik, Gıda..."
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Aylık Bütçe Aralığı">
              <select value={form.budget} onChange={handleChange('budget')} className="input">
                {budgetRanges.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kampanya Hedefi">
              <select value={form.goal} onChange={handleChange('goal')} className="input">
                {goals.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Kampanya Detayları">
            <textarea
              rows={4}
              maxLength={4000}
              value={form.message}
              onChange={handleChange('message')}
              className="input resize-none"
              placeholder="Hedef kitleniz, kampanya zamanlaması, beklentileriniz vb."
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
