import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Save } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import Modal from '../../components/admin/Modal.jsx'
import SearchBox from '../../components/admin/SearchBox.jsx'
import { matchesQuery } from '../../lib/search.js'
import { serviceIconMap } from '../ServicesPage.jsx'

const iconNames = Object.keys(serviceIconMap)

const emptyForm = {
  title: '',
  description: '',
  icon: iconNames[0],
  itemsText: '',
}

export default function AdminServicesPage() {
  const { services, addService, updateService, removeService } = useData()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [query, setQuery] = useState('')

  // Başlık, açıklama ve alt hizmetlerde arar.
  const visible = useMemo(
    () =>
      services.filter((service) =>
        matchesQuery(
          [service.title, service.description, ...(service.items || [])].join(' '),
          query
        )
      ),
    [services, query]
  )

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    setSaveError('')
  }

  function startEdit(service) {
    setEditingId(service.id)
    setForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      itemsText: (service.items || []).join('\n'),
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError('')
    const items = form.itemsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    const payload = {
      title: form.title,
      description: form.description,
      icon: form.icon,
      items,
    }
    try {
      if (editingId) {
        await updateService(editingId, payload)
      } else {
        await addService(payload)
      }
      closeForm()
    } catch (err) {
      setSaveError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return
    setDeleteError('')
    try {
      await removeService(id)
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hizmetler</h1>
          <p className="text-gray-500">Hizmetlerimiz sayfasındaki kategorileri yönetin.</p>
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

      <Modal
        open={showForm}
        title={editingId ? 'Hizmet Düzenle' : 'Yeni Hizmet'}
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
              form="service-form"

              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        }
      >
        <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {saveError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Başlık">
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
                placeholder="ör. Sosyal Medya Yönetimi"
              />
            </AdminField>
            <AdminField label="İkon">
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="input"
              >
                {iconNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>

          <AdminField label="Açıklama">
            <textarea
              rows={2}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
              placeholder="Kısa açıklama"
            />
          </AdminField>

          <AdminField label="Alt Hizmetler (her satıra bir tane)">
            <textarea
              rows={5}
              value={form.itemsText}
              onChange={(e) => setForm({ ...form, itemsText: e.target.value })}
              className="input resize-none font-mono text-sm"
              placeholder={'Instagram yönetimi\nTikTok yönetimi\n...'}
            />
          </AdminField>
        </form>
      </Modal>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Hizmet adı, açıklama veya alt hizmette ara…"
          label="Hizmetlerde ara"
          className="flex-1 min-w-56 sm:max-w-md"
        />
        <span className="text-sm text-gray-500">
          {query.trim() ? `${visible.length} sonuç` : `${services.length} hizmet`}
        </span>
      </div>

      {visible.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center text-gray-500">
          {services.length === 0
            ? 'Henüz hizmet eklenmedi.'
            : `“${query.trim()}” ile eşleşen hizmet bulunamadı.`}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {visible.map((service) => {
          const Icon = serviceIconMap[service.icon]
          return (
            <div key={service.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  {Icon && <Icon className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(service)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{service.description}</p>
              <p className="text-xs text-gray-400">{(service.items || []).length} alt hizmet</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdminField({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
