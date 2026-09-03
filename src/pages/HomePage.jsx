import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Users,
  Heart,
  Palette,
  Shirt,
  Sparkles,
  Plane,
  Briefcase,
  MapPin,
  Award,
} from 'lucide-react'
import { InstagramIcon } from '../components/BrandIcons.jsx'
import { useData } from '../context/DataContext.jsx'
import { useSeo, absoluteUrl } from '../lib/seo.js'
import { RESOURCES_INDEX_PATH } from '../lib/resources.js'
import { INFLUENCER_CARD_SIZES, influencerSrcSet } from '../lib/images.js'
import ResourceCard, { ResourceCardSkeleton } from '../components/resources/ResourceCard.jsx'

const heroAvatars = [
  { src: '/assets/boncuksara.webp', alt: 'Kullanıcı 1' },
  { src: '/assets/clburakkk.webp', alt: 'Kullanıcı 2' },
  { src: '/assets/dr_ilaydasimaygul.webp', alt: 'Kullanıcı 3' },
]

const services = [
  {
    title: 'Sanat & Life Style',
    description:
      "Sanatçıların markanıza kattığı değer.. Markanıza özel kurgular ile içerik üretirler.",
    Icon: Palette,
    color: 'rgb(220, 38, 38)',
    bg: 'rgba(220, 38, 38, 0.125)',
  },
  {
    title: 'Moda & Tasarım',
    description:
      'Eğer içeriğiniz moda ve tasarım ile ilgili görsellerse, Instagram doğası gereği sizin için uygun platformdur.',
    Icon: Shirt,
    color: 'rgb(239, 68, 68)',
    bg: 'rgba(239, 68, 68, 0.125)',
  },
  {
    title: 'Beauty',
    description:
      'Güzellik sırları güncelliğini asla kaybetmemiştir. Kozmetik ve güzellik içerikleri ile milyonlara ulaşın.',
    Icon: Sparkles,
    color: 'rgb(185, 28, 28)',
    bg: 'rgba(185, 28, 28, 0.125)',
  },
  {
    title: 'Seyahat',
    description: 'Keşfedilmemiş rotalar ve deneyimler ile takipçilerinizi büyüleyin.',
    Icon: Plane,
    color: 'rgb(220, 38, 38)',
    bg: 'rgba(220, 38, 38, 0.125)',
  },
]

const stats = [
  { value: 189, label: 'Özel Proje', Icon: Briefcase, color: 'rgb(220, 38, 38)', bg: 'rgba(220, 38, 38, 0.125)' },
  { value: 125, label: 'Hesap Yönetimi', Icon: Users, color: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.125)' },
  { value: 168, label: 'Mekan Tanıtımı', Icon: MapPin, color: 'rgb(185, 28, 28)', bg: 'rgba(185, 28, 28, 0.125)' },
  { value: 84, label: 'Ödüllü Proje', Icon: Award, color: 'rgb(220, 38, 38)', bg: 'rgba(220, 38, 38, 0.125)' },
]

const progressItems = [
  { label: 'Özel Proje', value: 40, color: 'rgb(220, 38, 38)' },
  { label: 'Hesap Yönetimi', value: 20, color: 'rgb(239, 68, 68)' },
  { label: 'Reklam Projeleri', value: 60, color: 'rgb(185, 28, 28)' },
  { label: 'Mekan Tanıtımı', value: 80, color: 'rgb(220, 38, 38)' },
]

export default function HomePage() {
  const { homeInfluencers, latestResources, resourceCategories, loading } = useData()

  useSeo({
    description:
      "Influencer Türkiye; markaları doğru influencer'larla buluşturur. Strateji, kampanya yönetimi, içerik üretimi ve performans pazarlaması tek çatı altında.",
    canonical: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Influencer Türkiye',
        url: absoluteUrl('/'),
        logo: absoluteUrl('/logo.svg'),
        email: 'hello@influencerturkiye.com',
        telephone: '+90 555 877 35 34',
        sameAs: [
          'https://www.instagram.com/influencerturkiyeofficial',
          'https://x.com/influenturkiye',
          'https://www.linkedin.com/company/influencer-türki̇ye',
        ],
      },
      // Arama kutusu işaretlemesi: Google sonuçlarında site içi arama sunar.
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Influencer Türkiye',
        url: absoluteUrl('/'),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${absoluteUrl(RESOURCES_INDEX_PATH)}?ara={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  })

  return (
    <>
      <section className="bg-white min-h-[60vh] flex items-center px-6 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-[1.1]">
                <div className="flex items-center gap-3 flex-wrap">
                  <span>Bul</span>
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 border-red-600 rounded-full">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-red-600" />
                  </div>
                  <span>Influencer'ları</span>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-3">
                  <div className="flex -space-x-2 sm:-space-x-3">
                    {heroAvatars.map((avatar, i) => (
                      <img
                        key={avatar.src}
                        alt={avatar.alt}
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 border-white object-cover shadow-md"
                        src={avatar.src}
                        style={{ zIndex: 3 - i }}
                      />
                    ))}
                  </div>
                  <span className="text-gray-900 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                    işbirliği için
                  </span>
                </div>
                <div className="text-gray-900 font-bold mt-2 sm:mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                  keşfet
                </div>
              </h1>

              <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap gap-4">
                <Link
                  to="/basvuru/influencer"
                  className="group inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-4 sm:px-8 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-600/30"
                >
                  Influencer Başvuru
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/basvuru/marka"
                  className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-black text-white px-6 py-4 sm:px-8 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/30"
                >
                  Marka Başvuru
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/iletisim"
                  className="group inline-flex items-center gap-3 bg-white border-2 border-red-600 hover:bg-red-50 text-red-600 px-6 py-4 sm:px-8 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg transition-all hover:scale-105"
                >
                  İletişime Geç
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:w-80 xl:w-96 lg:flex-shrink-0">
              <Link
                to="/hizmetlerimiz"
                className="w-full bg-red-600 hover:bg-red-700 rounded-3xl p-4 sm:p-8 min-h-[200px] sm:min-h-[320px] lg:min-h-[380px] flex flex-col relative overflow-hidden text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/20 cursor-pointer group"
              >
                <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="w-12 h-12 sm:w-20 sm:h-20">
                    <circle cx="60" cy="20" r="30" stroke="white" strokeWidth="1" opacity="0.2" fill="none" />
                    <circle cx="60" cy="20" r="50" stroke="white" strokeWidth="1" opacity="0.15" fill="none" />
                  </svg>
                </div>
                <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mb-auto group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-600" />
                </div>
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                  <ArrowUpRight className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="mt-auto">
                  <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-tight">
                    Hizmetlerimizi
                    <br />
                    Keşfedin
                  </h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Swiper
            className="influencer-swiper"
            modules={[Autoplay]}
            slidesPerView={2}
            spaceBetween={20}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 28 },
            }}
          >
            {homeInfluencers.map((inf) => {
              const srcSet = influencerSrcSet(inf.image)

              return (
                <SwiperSlide key={inf.id}>
                  <div className="group relative rounded-3xl overflow-hidden cursor-pointer bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all aspect-[3/4]">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        alt={inf.name}
                        width="300"
                        height="400"
                        srcSet={srcSet}
                        sizes={srcSet ? INFLUENCER_CARD_SIZES : undefined}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={inf.image}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute left-0 bottom-0 p-3 pr-16 md:pr-20">
                      <h3 className="text-white font-semibold text-sm md:text-base">{inf.name}</h3>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                          <span className="text-white text-xs md:text-sm font-medium">{inf.followers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                          <span className="text-white text-xs md:text-sm font-medium">{inf.engagement}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={inf.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10 hover:scale-110 transition-transform"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
                        <InstagramIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    </a>
                    <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-all duration-300" />
                  </div>
                </SwiperSlide>
              )
            })}
            <SwiperSlide>
              <Link
                to="/portfolyo"
                className="bg-red-600 hover:bg-red-700 rounded-3xl p-6 flex flex-col aspect-[3/4] transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/20 group h-full"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-auto group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">Tümünü Gör</h3>
                  <p className="text-white/90 text-sm">13 150 influencer</p>
                </div>
              </Link>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
              Hizmetlerimiz
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              Influencer'lar İnternetin
              <br />
              <span className="text-gray-600">Otoritesi Olmaya Devam Ediyor</span>
            </h2>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
              Mobilde geçirilen zamanın artması ile influencer'lar, samimi, ilgili ve
              etkileşimli takipçiler olan spesifik niş gruplar için kilit fikir
              önderleri oluyorlar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ title, description, Icon, color, bg }) => (
              <div
                key={title}
                className="group bg-gray-50 border border-gray-200 rounded-3xl p-8 hover:bg-red-50 hover:border-red-200 transition-all duration-300 cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <h3 className="text-gray-900 text-xl font-semibold mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-red-50 to-red-100 rounded-3xl p-8 md:p-12 border border-red-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Yeni Modern Influencer & Reklam
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Markalarla bireyler arasında kişisel ve güçlü bir bağlantı kuran
                  influencer marketing'in şirketlere sağladığı geri dönüş de oldukça
                  büyük. Pazarlamanın dijital versiyonu da denebilir.
                </p>
              </div>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  Influencer'ların öncülük ettiği bu cirolar sağlam, güvenilir ve üssel
                  bir şekilde geleneksel reklamcılık medyalarından daha etkili olarak
                  algılanıyor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
              Başarılarımız
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              Rakamlarla Influencer Türkiye
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map(({ value, label, Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white border border-gray-200 rounded-3xl p-8 text-center group hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-8 h-8" style={{ color }} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{value}</div>
                <div className="text-gray-600">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Proje Durumları</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {progressItems.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{label}</span>
                    <span className="text-gray-900 font-semibold">{value}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${value}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Son yazılar — blog bölümü ana sayfadan da erişilebilir olmalı,
          hem ziyaretçi hem arama motoru için önemli bir iç bağlantı. */}
      {(loading || latestResources.length > 0) && (
        <section className="bg-white py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
                  Kaynaklar
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
                  Son Yazılar
                </h2>
                <p className="text-gray-600 mt-3 max-w-xl">
                  Influencer marketing ve dijital pazarlama üzerine güncel rehberler.
                </p>
              </div>
              <Link
                to={RESOURCES_INDEX_PATH}
                className="group inline-flex items-center gap-2 text-red-600 font-semibold hover:gap-3 transition-all"
              >
                Tüm yazılar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 3 }, (_, i) => <ResourceCardSkeleton key={i} />)
                : latestResources.map((item) => (
                    <ResourceCard key={item.id} item={item} categories={resourceCategories} />
                  ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
