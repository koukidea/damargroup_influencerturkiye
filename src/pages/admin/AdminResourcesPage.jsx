import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Save, Search, Eye, ExternalLink, Wand2, ChevronDown, X,
} from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import { estimateReadTime, toPlainText, truncate } from '../../lib/contentFormat.js'
import { resolveCategory, resourcePath } from '../../lib/resources.js'
import ArticleContent from '../../components/resources/ArticleContent.jsx'
import ImageUploadField from '../../components/admin/ImageUploadField.jsx'
import Modal from '../../components/admin/Modal.jsx'

const PAGE_SIZE = 15
const SEARCH_DEBOUNCE_MS = 300

const STATUS_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'published', label: 'Yayında' },
  { key: 'draft', label: 'Taslak' },
]

const SORT_OPTIONS = [
  { key: 'newest', label: 'En yeni' },
  { key: 'oldest', label: 'En eski' },
  { key: 'views', label: 'En çok görüntülenen' },
  { key: 'title', label: 'Başlığa göre (A→Z)' },
]

const FORMAT_HELP = [
  ['## Başlık', 'Bölüm başlığı (H2)'],
  ['### Alt başlık', 'Ara başlık (H3)'],
  ['**kalın**', 'Kalın yazı'],
  ['*eğik*', 'Eğik yazı'],
  ['[metin](https://adres)', 'Bağlantı'],
  ['- madde', 'Madde listesi'],
  ['1. madde', 'Numaralı liste'],
  ['> alıntı', 'Alıntı bloğu'],
  ['![açıklama](/gorsel.webp)', 'Görsel'],
  ['---', 'Ayraç çizgisi'],
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm(defaultCategory) {
  return {
    title: '',
    category: defaultCategory || '',
    excerpt: '',
    readTime: '5 dk',
    date: todayISO(),
    content: '',
    coverImage: '',
    coverAlt: '',
    author: 'Influencer Türkiye',
    tags: '',
    status: 'published',
    seoTitle: '',
    seoDescription: '',
  }
}

export default function AdminResourcesPage() {
  const {
    resourceCategories, listResources, getResource,
    addResource, updateResource, removeResource,
  } = useData()

  const [data, setData] = useState({ items: [], total: 0, page: 1, pageCount: 1 })
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const searchTimer = useRef(null)

  // Yazarken aramak için: her tuşta değil, yazma durduktan kısa süre sonra
  // istek atılıyor. Böylece hem Enter'a basmak gerekmiyor hem sunucu boğulmuyor.
  function handleSearchChange(value) {
    setSearchInput(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      setSearch(value.trim())
    }, SEARCH_DEBOUNCE_MS)
  }

  function clearSearch() {
    clearTimeout(searchTimer.current)
    setSearchInput('')
    setPage(1)
    setSearch('')
  }

  useEffect(() => () => clearTimeout(searchTimer.current), [])

  const filtersActive = Boolean(search) || statusFilter !== 'all' || categoryFilter !== 'all' || sort !== 'newest'

  function resetFilters() {
    clearSearch()
    setStatusFilter('all')
    setCategoryFilter('all')
    setSort('newest')
  }

  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(() => emptyForm())
  const [formLoading, setFormLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showSeo, setShowSeo] = useState(false)

  const reload = useCallback(async () => {
    setListLoading(true)
    try {
      const result = await listResources({
        status: statusFilter,
        category: categoryFilter === 'all' ? '' : categoryFilter,
        q: search,
        sort,
        page,
        limit: PAGE_SIZE,
      })
      setData(result)
      setListError('')
    } catch (err) {
      setListError(err.message)
    } finally {
      setListLoading(false)
    }
  }, [listResources, statusFilter, categoryFilter, sort, search, page])

  useEffect(() => {
    reload()
  }, [reload])

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm(resourceCategories[0]?.slug))
    setSaveError('')
    setShowPreview(false)
    setShowForm(true)
  }

  // Liste yanıtı içerik metnini taşımıyor (kasıtlı), bu yüzden düzenlemede
  // yazının tamamı ayrıca çekiliyor.
  async function startEdit(row) {
    setEditingId(row.id)
    setSaveError('')
    setShowPreview(false)
    setShowForm(true)
    setFormLoading(true)
    try {
      const full = await getResource(row.slug)
      setForm({
        title: full.title,
        category: full.category,
        excerpt: full.excerpt,
        readTime: full.readTime,
        date: full.date,
        content: full.content,
        coverImage: full.coverImage,
        coverAlt: full.coverAlt,
        author: full.author,
        tags: full.tags.join(', '),
        status: full.status,
        seoTitle: full.seoTitle,
        seoDescription: full.seoDescription,
      })
      setShowSeo(Boolean(full.seoTitle || full.seoDescription))
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setSaveError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaveError('')
    setSaving(true)

    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    try {
      if (editingId) await updateResource(editingId, payload)
      else await addResource(payload)
      closeForm()
      setPage(1)
      await reload()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(row) {
    if (!confirm(`"${row.title}" yazısını silmek istediğinize emin misiniz?`)) return
    setDeleteError('')
    try {
      await removeResource(row.id)
      await reload()
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  const previewCategory = resolveCategory(resourceCategories, form.category)

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kaynaklar</h1>
          <p className="text-gray-500">
            Blog yazılarını yönetin. Yazılar <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/yazi-basligi</code> adresinde yayınlanır.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/kaynak-kategorileri"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Kategoriler
          </Link>
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Yeni Yazı
          </button>
        </div>
      </div>

      {deleteError && <Alert>{deleteError}</Alert>}

      <Modal
        open={showForm}
        size="lg"
        title={editingId ? 'Yazıyı Düzenle' : 'Yeni Yazı'}
        onClose={closeForm}
        headerActions={
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Düzenlemeye dön' : 'Önizle'}
          </button>
        }
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="text-sm text-gray-500 hover:text-gray-800 px-2"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              form="resource-form"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        }
      >
        <form id="resource-form" onSubmit={handleSubmit} className="space-y-4">
          {saveError && <Alert>{saveError}</Alert>}
          {formLoading && <p className="text-sm text-gray-500">Yazı yükleniyor…</p>}

          {showPreview ? (
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">
                Önizleme
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {form.title || 'Başlıksız yazı'}
              </h3>
              <p className="text-gray-600 mb-6">{form.excerpt}</p>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <ArticleContent content={form.content} color={previewCategory} />
              </div>
            </div>
          ) : (
            <>
              <Field label="Başlık" required>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="Yazı başlığı"
                />
              </Field>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Kategori" required>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input"
                  >
                    <option value="" disabled>
                      Seçiniz
                    </option>
                    {resourceCategories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Durum">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input"
                  >
                    <option value="published">Yayında</option>
                    <option value="draft">Taslak</option>
                  </select>
                </Field>

                <Field label="Tarih">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input"
                  />
                </Field>

                <Field label="Okuma Süresi">
                  <div className="flex gap-2">
                    <input
                      value={form.readTime}
                      onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                      className="input"
                      placeholder="ör. 5 dk"
                    />
                    <button
                      type="button"
                      title="İçerikten otomatik hesapla"
                      onClick={() => setForm((f) => ({ ...f, readTime: estimateReadTime(f.content) }))}
                      className="shrink-0 px-3 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>
                  </div>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Yazar">
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="input"
                    placeholder="Influencer Türkiye"
                  />
                </Field>
                <Field label="Etiketler" hint="Virgülle ayırın: influencer, roas, trend">
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="input"
                    placeholder="influencer marketing, strateji"
                  />
                </Field>
              </div>

              <ImageUploadField
                label="Kapak Görseli"
                aspect="aspect-[16/10]"
                value={form.coverImage}
                onChange={(coverImage) => setForm((prev) => ({ ...prev, coverImage }))}
                hint="Yatay (16:10) görseller kartlarda en iyi görünür."
              />

              <Field label="Görsel Açıklaması" hint="Görme engelliler ve SEO için">
                <input
                  value={form.coverAlt}
                  onChange={(e) => setForm({ ...form, coverAlt: e.target.value })}
                  className="input"
                  placeholder="Görselde ne var?"
                />
              </Field>

              <Field
                label="Özet"
                required
                hint={`Kartlarda ve arama sonucunda görünür. ${form.excerpt.length}/160 karakter`}
              >
                <textarea
                  rows={2}
                  required
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="input resize-none"
                  placeholder="Kart üzerinde görünecek kısa özet"
                />
              </Field>

              <Field label="İçerik" required>
                <textarea
                  rows={16}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input resize-y font-mono text-sm"
                  placeholder={'Paragraf metni buraya.\n\n## Alt Başlık\n\n**Kalın** ve [bağlantılı](https://ornek.com) metin.\n\n- Madde bir\n- Madde iki'}
                />
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-1.5">
                  {FORMAT_HELP.map(([syntax, meaning]) => (
                    <div key={syntax} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 shrink-0">
                        {syntax}
                      </code>
                      <span className="truncate">{meaning}</span>
                    </div>
                  ))}
                </div>
              </Field>

              <div>
                <button
                  type="button"
                  onClick={() => setShowSeo((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSeo ? 'rotate-180' : ''}`} />
                  Gelişmiş SEO ayarları
                </button>

                {showSeo && (
                  <div className="grid sm:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <Field
                      label="SEO Başlığı"
                      hint="Boş bırakılırsa yazı başlığı kullanılır (en fazla ~60 karakter)"
                    >
                      <input
                        value={form.seoTitle}
                        onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                        className="input"
                        placeholder={form.title}
                      />
                    </Field>
                    <Field
                      label="SEO Açıklaması"
                      hint="Boş bırakılırsa özet kullanılır (en fazla ~160 karakter)"
                    >
                      <textarea
                        rows={2}
                        value={form.seoDescription}
                        onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                        className="input resize-none"
                        placeholder={form.excerpt}
                      />
                    </Field>

                    <div className="sm:col-span-2 bg-white border border-gray-200 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-2">Google'da böyle görünecek:</p>
                      <p className="text-[#1a0dab] text-lg leading-snug truncate">
                        {form.seoTitle || form.title || 'Yazı başlığı'} | Influencer Türkiye
                      </p>
                      <p className="text-[#006621] text-sm">influencerturkiye.com › …</p>
                      <p className="text-sm text-gray-600 leading-snug">
                        {truncate(
                          form.seoDescription || form.excerpt || toPlainText(form.content),
                          160
                        ) || 'Açıklama metni burada görünecek.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </form>
      </Modal>

      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex-1 min-w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Başlık, özet veya etikette ara…"
              aria-label="Yazılarda ara"
              className="input pl-10 pr-10 py-2.5"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Aramayı temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setPage(1)
              setCategoryFilter(e.target.value)
            }}
            aria-label="Kategori"
            className="input w-auto py-2.5"
          >
            <option value="all">Tüm kategoriler</option>
            {resourceCategories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setPage(1)
              setSort(e.target.value)
            }}
            aria-label="Sıralama"
            className="input w-auto py-2.5"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setPage(1)
                setStatusFilter(f.key)
              }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                statusFilter === f.key
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="text-sm text-gray-500 ml-1">
            {listLoading ? '…' : `${data.total} yazı`}
          </span>
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

      {listError && <Alert>{listError}</Alert>}

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        {listLoading ? (
          <p className="text-center text-gray-500 py-16">Yükleniyor…</p>
        ) : data.items.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {filtersActive ? 'Bu filtrelerle eşleşen yazı yok.' : 'Henüz yazı eklenmedi.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">Başlık</th>
                  <th className="px-6 py-3 font-medium">Kategori</th>
                  <th className="px-6 py-3 font-medium">Durum</th>
                  <th className="px-6 py-3 font-medium">Tarih</th>
                  <th className="px-6 py-3 font-medium text-right">Görüntülenme</th>
                  <th className="px-6 py-3 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((item) => {
                  const category = resolveCategory(resourceCategories, item.category)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900 max-w-xs truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-400 max-w-xs truncate">
                          /{item.slug}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ color: category.color, backgroundColor: category.bg }}
                        >
                          {category.label}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                            item.status === 'draft'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {item.status === 'draft' ? 'Taslak' : 'Yayında'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{item.date}</td>
                      <td className="px-6 py-3 text-gray-500 text-right">{item.views}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={resourcePath(item.slug)}
                            target="_blank"
                            title="Sitede aç"
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => startEdit(item)}
                            title="Düzenle"
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Sil"
                            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.pageCount > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={data.page <= 1}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:border-red-200 hover:bg-red-50 transition-all"
          >
            Önceki
          </button>
          <span className="text-gray-500">
            Sayfa {data.page} / {data.pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, data.pageCount))}
            disabled={data.page >= data.pageCount}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:border-red-200 hover:bg-red-50 transition-all"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}

function Alert({ children }) {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
      {children}
    </div>
  )
}

function Field({ label, children, hint, required }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </label>
  )
}
