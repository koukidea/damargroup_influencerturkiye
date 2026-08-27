import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Target,
  Share2,
  Users,
  Megaphone,
  TrendingUp,
  Camera,
  PenTool,
  Monitor,
  ShoppingCart,
  Film,
  Calendar,
  Lightbulb,
  GraduationCap,
  Check,
  ArrowRight,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useSeo } from '../lib/seo.js'

export const serviceIconMap = {
  Target,
  Share2,
  Users,
  Megaphone,
  TrendingUp,
  Camera,
  PenTool,
  Monitor,
  ShoppingCart,
  Film,
  Calendar,
  Lightbulb,
  GraduationCap,
}

const palette = [
  { color: 'rgb(220, 38, 38)', bg: 'rgba(220, 38, 38, 0.125)' },
  { color: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.125)' },
  { color: 'rgb(185, 28, 28)', bg: 'rgba(185, 28, 28, 0.125)' },
]

const serviceImageMap = {
  'strateji-ve-marka-yonetimi': '/service-categories/strateji-ve-marka-yonetimi.jpg',
  'sosyal-medya-yonetimi': '/service-categories/sosyal-medya-yonetimi.jpg',
  'influencer-marketing': '/service-categories/influencer-marketing.jpg',
  'dijital-reklam-yonetimi': '/service-categories/dijital-reklam-yonetimi.jpg',
  'performans-pazarlamasi': '/service-categories/performans-pazarlamasi.jpg',
  'icerik-uretimi': '/service-categories/icerik-uretimi.jpg',
  'grafik-tasarim': '/service-categories/grafik-tasarim.jpg',
  'web-hizmetleri': '/service-categories/web-hizmetleri.jpg',
  'e-ticaret-danismanligi': '/service-categories/e-ticaret-danismanligi.jpg',
  produksiyon: '/service-categories/produksiyon.jpg',
  'etkinlik-ve-organizasyon': '/service-categories/etkinlik-ve-organizasyon.jpg',
  danismanlik: '/service-categories/danismanlik.jpg',
  egitim: '/service-categories/egitim.jpg',
}

export default function ServicesPage() {
  useSeo({
    title: 'Hizmetlerimiz',
    description:
      'Strateji, influencer marketing, sosyal medya yönetimi, dijital reklam, içerik üretimi ve e-ticaret danışmanlığı — markanızın ihtiyacı olan tüm dijital pazarlama hizmetleri.',
    canonical: '/hizmetlerimiz',
  })

  const location = useLocation()
  const { services } = useData()

  // Menüden bir hizmete tıklandığında ilgili bölüme kayıyoruz.
  // services bağımlılığı şart: hizmetler API'den gelene kadar bölümler
  // basılmamış oluyor ve adres doğrudan açıldığında hedef element henüz
  // bulunamıyordu. location.key ise aynı hizmete tekrar tıklandığında
  // (adres değişmediği için) kaydırmanın yine çalışmasını sağlıyor.
  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash, location.key, services])

  return (
    <>
      <section className="bg-white py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Hizmetlerimiz
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
            Markanız İçin Uçtan Uca
            <br />
            <span className="text-gray-600">Dijital Pazarlama Çözümleri</span>
          </h1>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            Strateji, sosyal medya, influencer marketing, reklam, içerik ve daha fazlası
            — markanızın ihtiyaç duyduğu her hizmeti tek çatı altında sunuyoruz.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {services.map((service, i) => {
              const Icon = serviceIconMap[service.icon]
              const { color, bg } = palette[i % palette.length]
              return (
                <a
                  key={service.id}
                  href={`#${service.slug}`}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 hover:border-red-200 hover:bg-red-50 transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 leading-tight">
                    {service.title}
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          {services.map((service, i) => {
            const Icon = serviceIconMap[service.icon]
            const { color, bg } = palette[i % palette.length]
            const image = serviceImageMap[service.slug]
            return (
              <div
                key={service.id}
                id={service.slug}
                className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-center scroll-mt-24 border-t border-gray-200 pt-16 first:border-t-0 first:pt-0"
              >
                {image && (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
                    <img
                      src={image}
                      alt={`${service.title} hizmeti`}
                      width="1200"
                      height="750"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                <div className={!image ? 'lg:col-span-2 lg:max-w-4xl' : undefined}>
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon className="w-7 h-7" style={{ color }} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-2">
                      {service.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>

                  <div className="grid sm:grid-cols-2 gap-3 mt-6">
                    {service.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: bg }}
                        >
                          <Check className="w-3 h-3" style={{ color }} />
                        </div>
                        <span className="text-sm text-gray-700 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-red-600 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Markanız İçin Nereden Başlayalım?
          </h2>
          <p className="text-red-50 mb-8">
            İhtiyacınıza en uygun hizmet paketini birlikte belirleyelim.
          </p>
          <Link
            to="/iletisim"
            className="group inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl"
          >
            İletişime Geç
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  )
}
