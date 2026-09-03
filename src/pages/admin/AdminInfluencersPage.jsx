import { useMemo, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  Home,
  Images,
  Search,
} from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import ImageUploadField from '../../components/admin/ImageUploadField.jsx'
import Modal from '../../components/admin/Modal.jsx'

// Tek liste iki yeri besliyor: anasayfadaki kart slider'ı ve portföy
// sayfasındaki "Kampanyalarımızda Yer Alan İsimler" galerisi. Kayıt üzerindeki
// iki kutu hangi sayfalarda görüneceğini belirler.

const emptyForm = {
  name: '',
  instagram: '',
  image: '',
  followers: '',
  engagement: '',
  show_on_home: true,
  show_in_portfolio: true,
}

const FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'home', label: 'Anasayfa', icon: Home },
  { key: 'portfolio', label: 'Portföy', icon: Images },
]

// Türkçe'ye duyarlı küçük harf: "İlayda" araması "ilayda" ile eşleşsin,
// "ISIL" da "ısıl" olsun. toLowerCase tek başına İ→i̇ (noktalı) üretir.
function fold(value) {
  return String(value ?? '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
}

// Form içinde önizleme amaçlı; asıl sadeleştirme sunucuda yapılıyor.
function previewHandle(value) {
  const raw = String(value ?? '')
    .trim()
    .replace(/^@+/, '')
  if (!raw) return ''
  return raw
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^instagram\.com\//i, '')
    .split(/[/?#]/)[0]
    .replace(/^@+/, '')
}

export default function AdminInfluencersPage() {
  const { influencers, addInfluencer, updateInfluencer, removeInfluencer, reorderInfluencers } =
    useData()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [listError, setListError] = useState('')

  const counts = useMemo(
    () => ({
      all: influencers.length,
      home: influencers.filter((i) => i.show_on_home).length,
      portfolio: influencers.filter((i) => i.show_in_portfolio).length,
    }),
    [influencers]
  )

  const visible = useMemo(() => {
    let list = influencers
    if (filter === 'home') list = list.filter((i) => i.show_on_home)
    if (filter === 'portfolio') list = list.filter((i) => i.show_in_portfolio)

    const terms = fold(query).split(/\s+/).filter(Boolean)
    if (!terms.length) return list
    return list.filter((i) => {
      const haystack = fold(`${i.name} ${i.handle} ${i.instagram}`)
      return terms.every((term) => haystack.includes(term))
    })
  }, [influencers, filter, query])

  // Sıralama okları yalnızca tam listede anlamlı; süzülmüş listede komşuluk
  // gerçek sırayı yansıtmaz.
  const canReorder = filter === 'all' && !query.trim()

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  function startEdit(inf) {
    setEditingId(inf.id)
    setForm({
      name: inf.name,
      instagram: inf.instagram,
      image: inf.image,
      followers: inf.followers || '',
      engagement: inf.engagement || '',
      show_on_home: !!inf.show_on_home,
      show_in_portfolio: !!inf.show_in_portfolio,
    })
    setSaveError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    setSaveError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError('')
    if (!form.image) {
      setSaveError('Lütfen bir görsel yükleyin ya da yolunu girin.')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateInfluencer(editingId, form)
      } else {
        await addInfluencer(form)
      }
      closeForm()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(inf) {
    if (
      !confirm(
        `${inf.name} kaydını silmek istediğinize emin misiniz? Bulunduğu tüm sayfalardan kaldırılır.`
      )
    )
      return
    setListError('')
    try {
      await removeInfluencer(inf.id)
    } catch (err) {
      setListError(err.message)
    }
  }

  async function move(inf, direction) {
    const index = influencers.findIndex((i) => i.id === inf.id)
    const target = index + direction
    if (target < 0 || target >= influencers.length) return
    const ids = influencers.map((i) => i.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    setListError('')
    try {
      await reorderInfluencers(ids)
    } catch (err) {
      setListError(err.message)
    }
  }

  const handle = previewHandle(form.instagram)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Influencer'lar</h1>
          <p className="text-gray-500">
            Anasayfadaki kartlar ve portföy sayfasındaki galeri bu listeden yönetilir. Her kayıt
            için hangi sayfalarda görüneceğini seçin.
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

      {listError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {listError}
        </div>
      )}

      <Modal
        open={showForm}
        title={editingId ? 'Influencer Düzenle' : 'Yeni Influencer'}
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
              form="influencer-form"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        }
      >
        <form id="influencer-form" onSubmit={handleSubmit} className="space-y-5">
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
              <span className="block text-xs text-gray-500 mt-1">
                Anasayfa kartında görünür. Portföy galerisinde @kullanıcıadı gösterilir.
              </span>
            </AdminField>
            <AdminField label="Instagram Linki veya Kullanıcı Adı">
              <input
                required
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="input"
                placeholder="https://www.instagram.com/kullaniciadi"
              />
              <span className="block text-xs text-gray-500 mt-1">
                {handle ? (
                  <>
                    Galeride <span className="font-medium text-gray-700">@{handle}</span> olarak
                    görünür.
                  </>
                ) : (
                  'Sadece kullanıcı adı da yazabilirsiniz; link otomatik oluşturulur.'
                )}
              </span>
            </AdminField>
          </div>

          <ImageUploadField
            label="Fotoğraf"
            value={form.image}
            onChange={(image) => setForm((prev) => ({ ...prev, image }))}
            hint="Dikey (3:4) fotoğraflar en iyi sonucu verir. Yeni fotoğraf yüklediğinizde eskisi otomatik değişir."
          />

          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-gray-700 mb-1.5">
              Nerede gösterilsin?
            </legend>
            <div className="grid sm:grid-cols-2 gap-3">
              <ToggleCard
                icon={Home}
                title="Anasayfa kartları"
                desc="Anasayfadaki kayan influencer kartları. Takipçi ve etkileşim bilgisi ister."
                checked={form.show_on_home}
                onChange={(checked) => setForm({ ...form, show_on_home: checked })}
              />
              <ToggleCard
                icon={Images}
                title="Portföy galerisi"
                desc="Portföy sayfasındaki “Kampanyalarımızda Yer Alan İsimler” bölümü."
                checked={form.show_in_portfolio}
                onChange={(checked) => setForm({ ...form, show_in_portfolio: checked })}
              />
            </div>
            {!form.show_on_home && !form.show_in_portfolio && (
              <span className="block text-xs text-red-600">En az bir sayfa seçmelisiniz.</span>
            )}
          </fieldset>

          {form.show_on_home && (
            <div className="grid sm:grid-cols-2 gap-4">
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
                  placeholder="ör. %3,8"
                />
                {/* Oran serbest metin; herkesin aynı yöntemle girmesi için formülü burada tutuyoruz. */}
                <span className="block text-xs text-gray-500 mt-1">
                  Son 10 gönderinin ortalama (beğeni + yorum) toplamı ÷ takipçi sayısı × 100.
                  Viral olmuş uç gönderileri hesaba katmayın. Instagram Insights'taki erişim bazlı
                  oranı değil, takipçi bazlı oranı kullanın; listedeki tüm kartlar aynı yöntemle
                  girilmeli. <span className="font-medium text-gray-700">%3,8</span> biçiminde yazın.
                </span>
              </AdminField>
            </div>
          )}
        </form>
      </Modal>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="relative flex-1 min-w-[220px] sm:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim veya kullanıcı adı ara…"
            aria-label="Influencer ara"
            className="w-full pl-10 pr-9 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Aramayı temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>
        {FILTERS.map((f) => (
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
            {f.icon && <f.icon className="w-3.5 h-3.5" />}
            {f.label}
            <span className={filter === f.key ? 'text-white/70' : 'text-gray-400'}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        {visible.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {influencers.length === 0
              ? 'Henüz influencer eklenmedi.'
              : query.trim()
                ? `“${query.trim()}” ile eşleşen influencer bulunamadı.`
                : 'Bu sayfada gösterilen influencer yok.'}
          </p>
        ) : (
          <>
            {query.trim() && (
              <div className="px-6 py-3 bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                {visible.length} sonuç
              </div>
            )}
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-medium">Influencer</th>
                  <th className="px-4 sm:px-6 py-3 font-medium">Gösterim</th>
                  <th className="hidden md:table-cell px-6 py-3 font-medium">Takipçi / Etkileşim</th>
                  <th className="px-4 sm:px-6 py-3 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((inf) => (
                  <tr key={inf.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={inf.image}
                          alt={inf.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-100"
                          onError={(e) => (e.currentTarget.style.opacity = 0.2)}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900">{inf.name}</div>
                          <a
                            href={inf.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-red-600 hover:underline"
                          >
                            @{inf.handle}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {inf.show_on_home && <Badge icon={Home}>Anasayfa</Badge>}
                        {inf.show_in_portfolio && <Badge icon={Images}>Portföy</Badge>}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-3 text-gray-600">
                      {inf.show_on_home ? (
                        <>
                          {inf.followers} <span className="text-gray-300">·</span> {inf.engagement}
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canReorder && (
                          <>
                            <IconButton
                              label="Yukarı taşı"
                              disabled={influencers[0]?.id === inf.id}
                              onClick={() => move(inf, -1)}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </IconButton>
                            <IconButton
                              label="Aşağı taşı"
                              disabled={influencers[influencers.length - 1]?.id === inf.id}
                              onClick={() => move(inf, 1)}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </IconButton>
                          </>
                        )}
                        <IconButton label="Düzenle" onClick={() => startEdit(inf)}>
                          <Pencil className="w-4 h-4" />
                        </IconButton>
                        <IconButton label="Sil" danger onClick={() => handleDelete(inf)}>
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
      {!canReorder && influencers.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          Sıralamayı değiştirmek için aramayı temizleyip “Tümü” görünümüne geçin. Sıra her iki
          sayfada da aynıdır.
        </p>
      )}
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

function ToggleCard({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${
        checked ? 'border-red-300 bg-red-50/60' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 accent-red-600"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
          <Icon className="w-4 h-4 text-red-600" />
          {title}
        </span>
        <span className="block text-xs text-gray-500 mt-0.5">{desc}</span>
      </span>
    </label>
  )
}

function Badge({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium">
      <Icon className="w-3 h-3" />
      {children}
    </span>
  )
}

function IconButton({ label, danger, disabled, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`p-2 rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed ${
        danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}
