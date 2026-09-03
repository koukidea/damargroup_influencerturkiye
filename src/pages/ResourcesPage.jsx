import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, AlertTriangle, ArrowUpDown } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useSeo } from '../lib/seo.js'
import { resolveCategory, RESOURCES_INDEX_PATH } from '../lib/resources.js'
import ResourceCard, { ResourceCardSkeleton } from '../components/resources/ResourceCard.jsx'
import Pagination from '../components/resources/Pagination.jsx'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 350

// Adres çubuğundaki Türkçe değer → API'nin sıralama anahtarı. Varsayılan (en
// yeni) adreste hiç görünmez; böylece paylaşılan bağlantılar kısa kalır.
const SORT_OPTIONS = [
  { key: 'yeni', api: 'newest', label: 'En yeni' },
  { key: 'eski', api: 'oldest', label: 'En eski' },
  { key: 'populer', api: 'views', label: 'En çok okunan' },
  { key: 'baslik', api: 'title', label: 'Başlığa göre (A→Z)' },
]
const DEFAULT_SORT = SORT_OPTIONS[0].key

export default function ResourcesPage() {
  const { resourceCategories, listResources } = useData()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeCategory = searchParams.get('kategori') || 'all'
  const page = Math.max(Number(searchParams.get('sayfa')) || 1, 1)
  const query = searchParams.get('ara') || ''
  const sortParam = searchParams.get('sirala') || DEFAULT_SORT
  const sort = SORT_OPTIONS.find((o) => o.key === sortParam) || SORT_OPTIONS[0]

  const [data, setData] = useState({ items: [], total: 0, pageCount: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState(query)

  // Adres çubuğu dışarıdan değişirse (geri tuşu, paylaşılan bağlantı) arama
  // kutusu da izlesin. Kutudaki metin zaten aynıysa dokunulmuyor; aksi hâlde
  // yazma sırasında adres güncellenince sondaki boşluk silinir, imleç oynardı.
  useEffect(() => {
    setSearchInput((current) => (current.trim() === query ? current : query))
  }, [query])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    listResources({
      category: activeCategory === 'all' ? '' : activeCategory,
      q: query,
      sort: sort.api === 'newest' ? '' : sort.api,
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
  }, [activeCategory, query, sort.api, page, listResources])

  const listTop = useRef(null)
  const updateParams = useCallback(
    (changes, { scroll = false } = {}) => {
      const next = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(changes)) {
        if (!value || value === 'all' || (key === 'sirala' && value === DEFAULT_SORT)) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
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
    // Sıralama aynı içeriğin farklı dizilişi; canonical'da tutulmaz ki arama
    // motorları her sıralamayı ayrı sayfa sanmasın.
    canonical: (() => {
      const canon = new URLSearchParams(searchParams)
      canon.delete('sirala')
      return `${RESOURCES_INDEX_PATH}${canon.toString() ? `?${canon}` : ''}`
    })(),
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

  // Yazarken arama: her tuşta değil, yazma durduktan kısa süre sonra adres
  // güncellenir (replace ile; geri tuşu her harf için ayrı adım görmesin).
  const searchTimer = useRef(null)
  useEffect(() => () => clearTimeout(searchTimer.current), [])

  function handleSearchChange(value) {
    setSearchInput(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      if (value.trim() !== query) updateParams({ ara: value.trim(), sayfa: '' })
    }, SEARCH_DEBOUNCE_MS)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    clearTimeout(searchTimer.current)
    updateParams({ ara: searchInput.trim(), sayfa: '' })
  }

  function clearSearch() {
    clearTimeout(searchTimer.current)
    setSearchInput('')
    updateParams({ ara: '', sayfa: '' })
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
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Yazılarda ara…"
              aria-label="Yazılarda ara"
              className="input pl-11 pr-32"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-[4.75rem] top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Aramayı temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
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

          <label className="ml-auto inline-flex items-center gap-2 text-sm text-gray-600">
            <ArrowUpDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="sr-only">Sıralama</span>
            <select
              value={sort.key}
              onChange={(e) => updateParams({ sirala: e.target.value, sayfa: '' })}
              className="bg-white border border-gray-200 hover:border-red-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
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
                onClick={clearSearch}
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
