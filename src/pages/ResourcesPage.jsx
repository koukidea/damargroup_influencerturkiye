import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useSeo } from '../lib/seo.js'
import { resolveCategory, RESOURCES_INDEX_PATH } from '../lib/resources.js'
import ResourceCard, { ResourceCardSkeleton } from '../components/resources/ResourceCard.jsx'
import Pagination from '../components/resources/Pagination.jsx'

const PAGE_SIZE = 12

export default function ResourcesPage() {
  const { resourceCategories, listResources } = useData()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeCategory = searchParams.get('kategori') || 'all'
  const page = Math.max(Number(searchParams.get('sayfa')) || 1, 1)
  const query = searchParams.get('ara') || ''

  const [data, setData] = useState({ items: [], total: 0, pageCount: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState(query)

  // Adres çubuğu dışarıdan değişirse (geri tuşu) arama kutusu da izlesin.
  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    listResources({
      category: activeCategory === 'all' ? '' : activeCategory,
      q: query,
      page,
      limit: PAGE_SIZE,
    })
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeCategory, query, page, listResources])

  const listTop = useRef(null)
  const updateParams = useCallback(
    (changes, { scroll = false } = {}) => {
      const next = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(changes)) {
        if (!value || value === 'all') next.delete(key)
        else next.set(key, String(value))
      }
      setSearchParams(next, { replace: true })
      if (scroll) listTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [searchParams, setSearchParams]
  )

  const category = activeCategory === 'all' ? null : resolveCategory(resourceCategories, activeCategory)

  // Sayfa başlığı filtreye göre değişiyor; her filtre kombinasyonu Google'da
  // aynı başlıkla görünmesin diye.
  const seoTitle = [
    category ? `${category.label} Yazıları` : 'Kaynaklar',
    page > 1 ? `Sayfa ${page}` : null,
  ]
    .filter(Boolean)
    .join(' — ')

  useSeo({
    title: seoTitle,
    description: category
      ? `${category.label} kategorisindeki influencer marketing ve dijital pazarlama rehberleri, analizler ve vaka çalışmaları.`
      : 'Influencer marketing, sosyal medya yönetimi ve dijital reklam üzerine pratik rehberler, sektör analizleri ve vaka çalışmaları.',
    canonical: `${RESOURCES_INDEX_PATH}${searchParams.toString() ? `?${searchParams}` : ''}`,
    // Arama sonucu sayfaları arama motorlarında ayrı birer sayfa olarak
    // dizinlenmemeli — içerik zaten liste sayfasında var.
    robots: query ? 'noindex, follow' : undefined,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seoTitle,
      description: 'Influencer marketing ve dijital pazarlama üzerine rehberler.',
      isPartOf: { '@type': 'WebSite', name: 'Influencer Türkiye' },
    },
  })

  function handleSearchSubmit(event) {
    event.preventDefault()
    updateParams({ ara: searchInput.trim(), sayfa: '' })
  }

  return (
    <>
      <section className="bg-white py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Kaynaklar
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
            Influencer Marketing ve Dijital
            <br />
            <span className="text-gray-600">Pazarlama Üzerine Rehberler</span>
          </h1>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            Kampanya sonuçlarını iyileştirmek isteyen markalar için pratik rehberler,
            sektör analizleri ve vaka çalışmaları.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Yazılarda ara…"
              aria-label="Yazılarda ara"
              className="input pl-11 pr-24"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Ara
            </button>
          </form>
        </div>
      </section>

      <section
        ref={listTop}
        className="bg-gray-50 py-6 px-6 sticky z-30 border-y border-gray-200"
        style={{ top: 'var(--header-height)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
          <button
            onClick={() => updateParams({ kategori: '', sayfa: '' })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-red-200 hover:bg-red-50'
            }`}
          >
            Tümü
          </button>
          {resourceCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateParams({ kategori: cat.slug, sayfa: '' })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.slug
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-red-200 hover:bg-red-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {query && (
            <div className="flex items-center gap-3 mb-8 text-sm text-gray-600">
              <span>
                <strong className="text-gray-900">“{query}”</strong> için {data.total} sonuç
              </span>
              <button
                onClick={() => updateParams({ ara: '', sayfa: '' })}
                className="inline-flex items-center gap-1 text-red-600 font-medium hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                Aramayı temizle
              </button>
            </div>
          )}

          {error ? (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Yazılar yüklenemedi ({error}). Lütfen sayfayı yenileyip tekrar deneyin.</p>
            </div>
          ) : loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              {query
                ? 'Aramanızla eşleşen yazı bulunamadı. Farklı bir kelime deneyin.'
                : 'Bu kategoride henüz içerik yayınlanmadı — yakında burada olacak.'}
            </p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((item) => (
                  <ResourceCard key={item.id} item={item} categories={resourceCategories} />
                ))}
              </div>
              <Pagination
                page={data.page}
                pageCount={data.pageCount}
                onChange={(next) => updateParams({ sayfa: next > 1 ? next : '' }, { scroll: true })}
              />
            </>
          )}
        </div>
      </section>
    </>
  )
}
