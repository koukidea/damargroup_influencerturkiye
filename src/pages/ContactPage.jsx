import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Users,
  Briefcase,
} from 'lucide-react'
import { InstagramIcon, LinkedinIcon, XIcon } from '../components/BrandIcons.jsx'
import { api } from '../lib/api.js'
import { useSeo } from '../lib/seo.js'

const PHONE_DISPLAY = '0 (555) 877 35 34'
const PHONE_HREF = 'tel:+905558773534'
const WHATSAPP_HREF =
  'https://wa.me/905558773534?text=Merhaba%2C%20influencer%20marketing%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.'
const EMAIL = 'hello@influencerturkiye.com'

const subjects = [
  'Marka İş Birliği',
  'Influencer Başvurusu',
  'Hizmet ve Fiyat Bilgisi',
  'Basın ve Medya',
  'Diğer',
]

const socials = [
  {
    label: 'Instagram',
    handle: '@influencerturkiyeofficial',
    href: 'https://www.instagram.com/influencerturkiyeofficial',
    Icon: InstagramIcon,
  },
  {
    label: 'X (Twitter)',
    handle: '@influenturkiye',
    href: 'https://x.com/influenturkiye',
    Icon: XIcon,
  },
  {
    label: 'LinkedIn',
    handle: 'Influencer Türkiye',
    href: 'https://www.linkedin.com/company/influencer-türki̇ye',
    Icon: LinkedinIcon,
  },
]

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  subject: subjects[0],
  message: '',
}

export default function ContactPage() {
  useSeo({
    title: 'İletişim',
    description:
      'Influencer marketing ve dijital pazarlama ihtiyaçlarınız için bize ulaşın. Telefon, e-posta ve WhatsApp üzerinden hızlıca dönüş yapıyoruz.',
    canonical: '/iletisim',
  })

  const [form, setForm] = useState(emptyForm)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleChange(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      await api.post('/applications', { type: 'contact', ...form, consent })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="bg-white py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            İletişim
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
            Konuşarak Başlayalım
            <br />
            <span className="text-gray-600">Size En Uygun Yolu Bulalım</span>
          </h1>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            Kampanya fikriniz, hizmet talebiniz ya da merak ettiğiniz bir konu için
            bize ulaşın. Ekibimiz en kısa sürede size dönüş yapar.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-8 px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ContactCard
            Icon={Phone}
            label="Telefon"
            value={PHONE_DISPLAY}
            hint="Hafta içi 09:00 - 18:00"
            href={PHONE_HREF}
          />
          <ContactCard
            Icon={MessageCircle}
            label="WhatsApp"
            value={PHONE_DISPLAY}
            hint="En hızlı dönüş kanalımız"
            href={WHATSAPP_HREF}
            external
          />
          <ContactCard
            Icon={Mail}
            label="E-posta"
            value={EMAIL}
            hint="Teklif ve dosya gönderimi"
            href={`mailto:${EMAIL}`}
          />
          <ContactCard
            Icon={Clock}
            label="Çalışma Saatleri"
            value="Pzt - Cum"
            hint="09:00 - 18:00 arası"
          />
        </div>
      </section>

      <section className="bg-white py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
          <div>
            {submitted ? (
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Mesajınız Bize Ulaştı
                </h2>
                <p className="text-gray-600 mb-8">
                  {form.name.split(' ')[0]}, talebinizi inceleyip en kısa sürede
                  size dönüş yapacağız. Acil bir konuysa WhatsApp'tan da
                  yazabilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={WHATSAPP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all"
                  >
                    WhatsApp'tan Yaz
                  </a>
                  <button
                    onClick={() => {
                      setForm(emptyForm)
                      setConsent(false)
                      setSubmitted(false)
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-red-600 hover:text-red-600 text-gray-700 px-6 py-3 rounded-2xl font-semibold transition-all"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Bize Mesaj Gönderin
                </h2>
                <p className="text-gray-600 mb-8">
                  Formu doldurun, ihtiyacınıza uygun ekip arkadaşımız size dönsün.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-5"
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
                        placeholder="ornek@sirket.com"
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
                    <Field label="Konu">
                      <select
                        value={form.subject}
                        onChange={handleChange('subject')}
                        className="input"
                      >
                        {subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Mesajınız" required>
                    <textarea
                      rows={5}
                      required
                      maxLength={4000}
                      value={form.message}
                      onChange={handleChange('message')}
                      className="input resize-none"
                      placeholder="Talebinizi kısaca anlatın: marka/kurum adı, hedefiniz ve zamanlamanız."
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
                      Paylaştığım bilgilerin talebimin değerlendirilmesi amacıyla
                      işlenmesini kabul ediyorum.{' '}
                      <Link
                        to="/kvkk"
                        className="text-red-600 hover:underline font-medium"
                      >
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
                    disabled={submitting}
                    className="group w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:hover:bg-red-600 disabled:hover:scale-100 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all hover:scale-[1.02]"
                  >
                    {submitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Doğrudan Başvuru
            </h2>
            <p className="text-gray-600 mb-6">
              Ne için geldiğinizi biliyorsanız, formu atlayıp doğrudan başvurun.
            </p>

            <Link
              to="/basvuru/marka"
              className="group flex items-start gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:border-red-200 hover:bg-red-50 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                <Briefcase className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  Markayım, kampanya kurmak istiyorum
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Bütçe ve hedefinize uygun influencer portföyünü birlikte belirleyelim.
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
            </Link>

            <Link
              to="/basvuru/influencer"
              className="group flex items-start gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:border-red-200 hover:bg-red-50 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  Influencer'ım, ağınıza katılmak istiyorum
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Profilinizi paylaşın, size uygun marka iş birliklerinde önceliklendirelim.
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
            </Link>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mt-6">
              <p className="text-sm font-semibold text-gray-900 mb-4">
                Sosyal Medyada Biz
              </p>
              <div className="space-y-2">
                {socials.map(({ label, handle, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 -mx-1 hover:bg-white transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-red-600 group-hover:border-red-200 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-red-600 transition-colors">
                        {label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{handle}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-red-600 transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-red-600 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Hangi Hizmete İhtiyacınız Olduğundan Emin Değil misiniz?
          </h2>
          <p className="text-red-50 mb-8">
            13 farklı hizmet başlığımıza göz atın, size uygun olanı birlikte netleştirelim.
          </p>
          <Link
            to="/hizmetlerimiz"
            className="group inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl"
          >
            Hizmetlerimizi İnceleyin
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  )
}

function ContactCard({ Icon, label, value, hint, href, external }) {
  const content = (
    <>
      <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
        <Icon className="w-5 h-5 text-red-600" />
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-800 group-hover:text-red-600 transition-colors break-all">
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </>
  )

  const className =
    'group block bg-white border border-gray-200 rounded-2xl p-5 transition-all hover:border-red-200 hover:shadow-md'

  if (!href) {
    return <div className={className}>{content}</div>
  }

  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
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
