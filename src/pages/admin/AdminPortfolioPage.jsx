import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'

const emptyForm = { handle: '', image: '', instagram: '' }

export default function AdminPortfolioPage() {
  const {
    portfolioCreators,
    addPortfolioCreator,
    updatePortfolioCreator,
    removePortfolioCreator,
  } = useData()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function startEdit(creator) {
    setEditingId(creator.id)
    setForm({
      handle: creator.handle,
      image: creator.image,
      instagram: creator.instagram,
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError('')
    try {
      if (editingId) {
        await updatePortfolioCreator(editingId, form)
      } else {
        await addPortfolioCreator(form)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      setSaveError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu içerik üreticisini galeriden kaldırmak istediğinize emin misiniz?')) return
    setDeleteError('')
    try {
      await removePortfolioCreator(id)
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portföy Galerisi</h1>
          <p className="text-gray-500">
            Portföy sayfasındaki "Kampanyalarımızda Yer Alan İsimler" galerisini yönetin.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          Yeni Ekle
        </button>
      </div>

      {deleteError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {deleteError}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {editingId ? 'İçerik Üreticisini Düzenle' : 'Yeni İçerik Üreticisi'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {saveError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Instagram Kullanıcı Adı">
              <input
                required
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                className="input"
                placeholder="kullaniciadi"
              />
              <span className="block text-xs text-gray-500 mt-1">
                Kartın üzerinde @kullaniciadi olarak görünür.
              </span>
            </AdminField>
            <AdminField label="Görsel Yolu / URL">
              <input
                required
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input"
                placeholder="/portf/kullaniciadi.webp veya https://..."
              />
              <span className="block text-xs text-gray-500 mt-1">
                Görseli sunucuda public/portf klasörüne yükleyip yolunu yazın.
              </span>
            </AdminField>
            <AdminField label="Instagram Linki (opsiyonel)" full>
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="input"
                placeholder="Boş bırakılırsa kullanıcı adından üretilir"
              />
            </AdminField>
          </div>

          {form.image && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Önizleme:</span>
              <img
                src={form.image}
                alt="önizleme"
                className="w-16 h-20 rounded-xl object-cover border border-gray-200"
                onError={(e) => (e.currentTarget.style.opacity = 0.2)}
              />
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        {portfolioCreators.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            Galeride henüz içerik üreticisi yok.
          </p>
        ) : (
          <>
            <div className="px-6 py-3 bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              Toplam {portfolioCreators.length} içerik üreticisi
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">İçerik Üreticisi</th>
                  <th className="px-6 py-3 font-medium">Instagram</th>
                  <th className="px-6 py-3 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolioCreators.map((creator) => (
                  <tr key={creator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.image}
                          alt={creator.handle}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <span className="font-medium text-gray-900">@{creator.handle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <a
                        href={creator.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-red-600 hover:underline"
                      >
                        {creator.instagram}
                      </a>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(creator)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(creator.id)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

function AdminField({ label, full, children }) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
