import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'

const emptyForm = { name: '', image: '', followers: '', engagement: '', instagram: '' }

export default function AdminInfluencersPage() {
  const { influencers, addInfluencer, updateInfluencer, removeInfluencer } = useData()
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

  function startEdit(inf) {
    setEditingId(inf.id)
    setForm({
      name: inf.name,
      image: inf.image,
      followers: inf.followers,
      engagement: inf.engagement,
      instagram: inf.instagram,
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError('')
    try {
      if (editingId) {
        await updateInfluencer(editingId, form)
      } else {
        await addInfluencer(form)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      setSaveError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu influencer kartını silmek istediğinize emin misiniz?')) return
    setDeleteError('')
    try {
      await removeInfluencer(id)
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Influencer'lar</h1>
          <p className="text-gray-500">Anasayfadaki influencer kartlarını yönetin.</p>
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
              {editingId ? 'Influencer Düzenle' : 'Yeni Influencer'}
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
            <AdminField label="İsim">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Ad Soyad"
              />
            </AdminField>
            <AdminField label="Görsel Yolu / URL">
              <input
                required
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input"
                placeholder="/assets/webp/isim.webp veya https://..."
              />
            </AdminField>
            <AdminField label="Takipçi Sayısı">
              <input
                required
                value={form.followers}
                onChange={(e) => setForm({ ...form, followers: e.target.value })}
                className="input"
                placeholder="ör. 250K"
              />
            </AdminField>
            <AdminField label="Etkileşim Oranı">
              <input
                required
                value={form.engagement}
                onChange={(e) => setForm({ ...form, engagement: e.target.value })}
                className="input"
                placeholder="ör. %4"
              />
            </AdminField>
            <AdminField label="Instagram Linki" full>
              <input
                required
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="input"
                placeholder="https://www.instagram.com/kullaniciadi"
              />
            </AdminField>
          </div>

          {form.image && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Önizleme:</span>
              <img
                src={form.image}
                alt="önizleme"
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
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
        {influencers.length === 0 ? (
          <p className="text-center text-gray-500 py-16">Henüz influencer eklenmedi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Influencer</th>
                <th className="px-6 py-3 font-medium">Takipçi</th>
                <th className="px-6 py-3 font-medium">Etkileşim</th>
                <th className="px-6 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {influencers.map((inf) => (
                <tr key={inf.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={inf.image}
                        alt={inf.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <span className="font-medium text-gray-900">{inf.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{inf.followers}</td>
                  <td className="px-6 py-3 text-gray-600">{inf.engagement}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(inf)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(inf.id)}
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
