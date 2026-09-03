import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { applicationMeta, applicationTitle, formatApplicationDate } from '../../lib/applications.js'

const TYPE_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'influencer', label: 'Influencer' },
  { key: 'brand', label: 'Marka' },
  { key: 'contact', label: 'İletişim' },
]

const DATE_FILTERS = [
  { key: 'all', label: 'Tüm zamanlar', days: null },
  { key: '1', label: 'Son 24 saat', days: 1 },
  { key: '7', label: 'Son 7 gün', days: 7 },
  { key: '30', label: 'Son 30 gün', days: 30 },
  { key: '90', label: 'Son 90 gün', days: 90 },
]

const SORT_OPTIONS = [
  { key: 'newest', label: 'En yeni' },
  { key: 'oldest', label: 'En eski' },
]

// Türkçe'ye duyarlı küçük harf (İ→i, I→ı); toLowerCase tek başına İ'yi
// noktalı i̇ yapar ve "İstanbul" araması "istanbul" ile eşleşmez.
function fold(value) {
  return String(value ?? '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
}

// Kayıttaki tüm metin alanları tek bir arama metnine indirgenir; böylece
// isim, e-posta, telefon, Instagram, şirket, konu ve mesaj hep aranabilir.
function searchText(app) {
  return fold(
    Object.entries(app)
      .filter(([key, value]) => key !== 'id' && key !== 'createdAt' && typeof value === 'string')
      .map(([, value]) => value)
      .join(' ')
  )
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    api
      .get('/applications')
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const result = { all: applications.length, influencer: 0, brand: 0, contact: 0 }
    for (const app of applications) result[app.type] = (result[app.type] || 0) + 1
    return result
  }, [applications])

  const filtered = useMemo(() => {
    let list = applications
    if (filter !== 'all') list = list.filter((a) => a.type === filter)

    const days = DATE_FILTERS.find((d) => d.key === dateFilter)?.days
    if (days) {
      const since = Date.now() - days * 24 * 60 * 60 * 1000
      list = list.filter((a) => new Date(a.createdAt).getTime() >= since)
    }

    const terms = fold(query).split(/\s+/).filter(Boolean)
    if (terms.length) {
      list = list.filter((a) => {
        const haystack = searchText(a)
        return terms.every((term) => haystack.includes(term))
      })
    }

    if (sort === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }
    return list
  }, [applications, filter, dateFilter, query, sort])

  const filtersActive =
    filter !== 'all' || dateFilter !== 'all' || sort !== 'newest' || Boolean(query.trim())

  function resetFilters() {
    setFilter('all')
    setDateFilter('all')
    setSort('newest')
    setQuery('')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Başvurular</h1>
        <p className="text-gray-500">
          Influencer, marka ve iletişim formlarından gelen kayıtlar.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex-1 min-w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim, e-posta, telefon, şirket, Instagram veya mesajda ara…"
              aria-label="Başvurularda ara"
              className="input pl-10 pr-10 py-2.5"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Aramayı temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Tarih aralığı"
            className="input w-auto py-2.5"
          >
            {DATE_FILTERS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sıralama"
            className="input w-auto py-2.5"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f.key
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f.label}
              <span className={filter === f.key ? 'text-white/70' : 'text-gray-400'}>
                {counts[f.key] ?? 0}
              </span>
            </button>
          ))}
          {!loading && (
            <span className="text-sm text-gray-500 ml-1">
              {filtersActive ? `${filtered.length} sonuç` : `${applications.length} başvuru`}
            </span>
          )}
          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto text-sm text-gray-500 hover:text-red-600 underline-offset-2 hover:underline"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          Başvurular yüklenemedi ({error}).
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center text-gray-500">
          {applications.length === 0
            ? 'Henüz başvuru yok.'
            : 'Bu filtrelerle eşleşen başvuru yok.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const meta = applicationMeta(app.type)
            const title = applicationTitle(app)

            return (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.iconWrap}`}
                  >
                    <meta.Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500">{formatApplicationDate(app.createdAt)}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.badge}`}
                >
                  {meta.label}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mt-3">
                <p><span className="text-gray-400">E-posta:</span> {app.email}</p>
                <p><span className="text-gray-400">Telefon:</span> {app.phone}</p>
                {app.type === 'influencer' && (
                  <>
                    <p><span className="text-gray-400">Instagram:</span> {app.instagram}</p>
                    <p><span className="text-gray-400">Takipçi:</span> {app.followers}</p>
                    <p><span className="text-gray-400">Kategori:</span> {app.category}</p>
                    <p><span className="text-gray-400">Şehir:</span> {app.city}</p>
                  </>
                )}
                {app.type === 'brand' && (
                  <>
                    <p><span className="text-gray-400">Yetkili:</span> {app.contactName}</p>
                    <p><span className="text-gray-400">Sektör:</span> {app.sector}</p>
                    <p><span className="text-gray-400">Bütçe:</span> {app.budget}</p>
                    <p><span className="text-gray-400">Hedef:</span> {app.goal}</p>
                  </>
                )}
                {app.type === 'contact' && (
                  <p><span className="text-gray-400">Konu:</span> {app.subject}</p>
                )}
                {/* Onay kaydı bu alan eklenmeden önceki başvurularda yok;
                    "kayıt yok" yazmak, boş bırakıp onaylanmış gibi
                    göstermekten daha doğru. */}
                <p>
                  <span className="text-gray-400">KVKK onayı:</span>{' '}
                  {app.consent ? (
                    <span className="text-green-600 font-medium">
                      {app.consent}
                      {app.consentVersion && ` (${app.consentVersion} sürümü)`}
                    </span>
                  ) : (
                    <span className="text-gray-400">kayıt yok</span>
                  )}
                </p>
              </div>
              {app.message && (
                <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                  {app.message}
                </p>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
