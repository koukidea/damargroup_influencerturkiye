import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { InstagramIcon } from '../components/BrandIcons.jsx'
import { caseStudies, caseCategories } from '../data/portfolio.js'
import { useData } from '../context/DataContext.jsx'
import { useSeo } from '../lib/seo.js'

export default function PortfolioPage() {
  useSeo({
    title: 'Portföy',
    description:
      "Influencer Türkiye'nin yürüttüğü kampanyalar, çalıştığı influencer'lar ve marka işbirliklerinden örnekler.",
    canonical: '/portfolyo',
  })

  const { portfolioCreators } = useData()
  const [category, setCategory] = useState('Tümü')

  const filtered =
    category === 'Tümü'
      ? caseStudies
      : caseStudies.filter((c) => c.category === category)

  return (
    <>
      <section className="bg-white pt-16 md:pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Portföy
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
            Birlikte Çalıştığımız
            <br />
            <span className="text-gray-600">İçerik Üreticileri ve Kampanyalar</span>
          </h1>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            Farklı sektörlerden markalar için kurguladığımız kampanyalardan ve
            ağımızdaki içerik üreticilerinden bir seçki.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-12 md:py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 mb-8">
            {caseCategories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === c
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-red-200 hover:bg-red-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-red-200 hover:shadow-xl transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    alt={`${item.title} — ${item.brand} kampanya görseli`}
                    width="900"
                    height="675"
                    loading="lazy"
                    decoding="async"
                    src={item.image}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-gray-800 backdrop-blur-sm">
                    {item.category}
                  </span>
                  <p className="absolute bottom-4 left-4 text-white/90 text-sm font-medium">
                    {item.brand}
                  </p>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">
                    {item.summary}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {item.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-center"
                      >
                        <p className="text-base font-bold text-gray-900 leading-none">
                          {m.value}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100">
                    {item.scope.map((s) => (
                      <span
                        key={s}
                        className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Galeri veritabanından geliyor; liste boşken (veya henüz yüklenmemişken)
          "0+ içerik üreticisi" yazan boş bir bölüm göstermemek için gizleniyor. */}
      {portfolioCreators.length > 0 && (
        <section className="bg-white py-16 md:py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
                Ağımız
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-4">
                Kampanyalarımızda Yer Alan İsimler
              </h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Ağımızdaki {portfolioCreators.length}+ içerik üreticisinden bir bölümü.
                Profillere göz atmak için kartlara tıklayabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {portfolioCreators.map((p) => (
                <a
                  key={p.id}
                  href={p.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[3/4] hover:border-red-200 hover:shadow-lg transition-all"
                >
                  <img
                    alt={`@${p.handle}`}
                    loading="lazy"
                    src={p.image}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between gap-2">
                    <span className="text-white text-xs font-medium truncate">
                      @{p.handle}
                    </span>
                    <span className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <InstagramIcon className="w-3.5 h-3.5 text-white" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-red-600 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Sıradaki Kampanya Sizinki Olsun
          </h2>
          <p className="text-red-50 mb-8">
            Hedefinizi ve bütçenizi paylaşın, size özel influencer portföyünü
            birlikte oluşturalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/basvuru/marka"
              className="group inline-flex items-center justify-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl"
            >
              Marka Başvurusu
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/iletisim"
              className="group inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all"
            >
              İletişime Geç
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
