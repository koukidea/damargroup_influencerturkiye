import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Save, ArrowLeft } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import Modal from '../../components/admin/Modal.jsx'
import SearchBox from '../../components/admin/SearchBox.jsx'
import { matchesQuery } from '../../lib/search.js'
import { CATEGORY_ICONS, CATEGORY_ICON_NAMES, resolveCategory } from '../../lib/resources.js'

// Hazır renk çiftleri: yazı rengi + aynı rengin şeffaf arka planı. Elle
// hex girmek yerine seçilebilir olması tutarlı bir görünüm sağlıyor.
const PALETTE = [
  { name: 'Kırmızı', color: 'rgb(220, 38, 38)', bg: 'rgba(220, 38, 38, 0.125)' },
  { name: 'Açık Kırmızı', color: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.125)' },
  { name: 'Koyu Kırmızı', color: 'rgb(185, 28, 28)', bg: 'rgba(185, 28, 28, 0.125)' },
  { name: 'Turuncu', color: 'rgb(234, 88, 12)', bg: 'rgba(234, 88, 12, 0.125)' },
  { name: 'Amber', color: 'rgb(217, 119, 6)', bg: 'rgba(217, 119, 6, 0.125)' },
  { name: 'Yeşil', color: 'rgb(22, 163, 74)', bg: 'rgba(22, 163, 74, 0.125)' },
  { name: 'Mavi', color: 'rgb(37, 99, 235)', bg: 'rgba(37, 99, 235, 0.125)' },
  { name: 'Mor', color: 'rgb(147, 51, 234)', bg: 'rgba(147, 51, 234, 0.125)' },
  { name: 'Gri', color: 'rgb(71, 85, 105)', bg: 'rgba(71, 85, 105, 0.125)' },
]

function emptyForm() {
  return {
    label: '',
    description: '',
    icon: 'Newspaper',
    color: PALETTE[0].color,
    bg: PALETTE[0].bg,
  }
}

export default function AdminResourceCategoriesPage() {
  const {
    resourceCategories,
    addResourceCategory,
    updateResourceCategory,
    removeResourceCategory,
  } = useData()

  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [query, setQuery] = useState('')

  // Ad, açıklama ve adreste (slug) arar.
  const visible = useMemo(
    () =>
      resourceCategories.filter((category) =>
        matchesQuery([category.label, category.description, category.slug].join(' '), query)
      ),
    [resourceCategories, query]
  )

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm())
    setSaveError('')
    setShowForm(true)
  }

  function startEdit(category) {
    setEditingId(category.id)
    setForm({
      label: category.label,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      bg: category.bg,
    })
    setSaveError('')
    setShowForm(true)
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
    try {
      if (editingId) await updateResourceCategory(editingId, form)
      else await addResourceCategory(form)
      closeForm()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category) {
    if (!confirm(`"${category.label}" kategorisini silmek istediğinize emin misiniz?`)) return
    setDeleteError('')
    try {
      await removeResourceCategory(category.id)
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  const PreviewIcon = CATEGORY_ICONS[form.icon] || CATEGORY_ICONS.Newspaper

  return (
    <div>
      <Link
        to="/admin/kaynaklar"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Yazılara dön
      </Link>

      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kaynak Kategorileri</h1>
          <p className="text-gray-500">
            Yazıların gruplandığı kategorileri yönetin. Kategori adresi (slug) ilk oluşturmada
            belirlenir ve sonradan değişmez.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          Yeni Kategori
        </button>
      </div>

      {deleteError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {deleteError}
        </div>
      )}

      <Modal
        open={showForm}
        title={editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
        onClose={closeForm}
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
              form="category-form"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-5">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {saveError}
            </div>
          )}

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Adı</span>
            <input
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="input"
              placeholder="ör. Vaka Analizleri"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</span>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              placeholder="Menüde kategorinin altında görünen kısa açıklama"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Header'daki Kaynaklar açılır menüsünde kategori adının altında gösterilir.
            </p>
          </label>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">İkon</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICON_NAMES.map((name) => {
                const Icon = CATEGORY_ICONS[name]
                const active = form.icon === name
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => setForm({ ...form, icon: name })}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                      active
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Renk</span>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((entry) => {
                const active = form.color === entry.color
                return (
                  <button
                    key={entry.name}
                    type="button"
                    title={entry.name}
                    onClick={() => setForm({ ...form, color: entry.color, bg: entry.bg })}
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all ${
                      active ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: entry.bg }}
                  >
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">
              Önizleme
            </p>
            <div className="flex items-center gap-3">
              <span
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: form.bg }}
              >
                <PreviewIcon className="w-6 h-6" style={{ color: form.color }} />
              </span>
              <span className="min-w-0">
                <span
                  className="block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: form.color }}
                >
                  {form.label || 'Kategori Adı'}
                </span>
                {form.description && (
                  <span className="block text-xs text-gray-500 mt-1">{form.description}</span>
                )}
              </span>
            </div>
          </div>
        </form>
      </Modal>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Kategori adı, açıklama veya adreste ara…"
          label="Kategorilerde ara"
          className="flex-1 min-w-56 sm:max-w-md"
        />
        <span className="text-sm text-gray-500">
          {query.trim() ? `${visible.length} sonuç` : `${resourceCategories.length} kategori`}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        {visible.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {resourceCategories.length === 0
              ? 'Henüz kategori eklenmedi.'
              : `“${query.trim()}” ile eşleşen kategori bulunamadı.`}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">Kategori</th>
                  <th className="px-6 py-3 font-medium">Adres (slug)</th>
                  <th className="px-6 py-3 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((category) => {
                  const resolved = resolveCategory(resourceCategories, category.slug)
                  const { Icon } = resolved
                  return (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: resolved.bg }}
                          >
                            <Icon className="w-4 h-4" style={{ color: resolved.color }} />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-gray-900">
                              {category.label}
                            </span>
                            {category.description && (
                              <span className="block text-xs text-gray-400 truncate max-w-md">
                                {category.description}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-400">
                        /kaynaklar?kategori={category.slug}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(category)}
                            title="Düzenle"
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
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
    </div>
  )
}
