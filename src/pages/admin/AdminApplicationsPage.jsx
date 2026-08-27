import { useEffect, useState } from 'react'
import { Users, Briefcase, MessageSquare } from 'lucide-react'
import { api } from '../../lib/api.js'

const typeMeta = {
  influencer: {
    label: 'Influencer Başvuru',
    Icon: Users,
    iconWrap: 'bg-red-50',
    iconColor: 'text-red-600',
    badge: 'bg-red-50 text-red-600',
  },
  brand: {
    label: 'Marka Başvuru',
    Icon: Briefcase,
    iconWrap: 'bg-gray-100',
    iconColor: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-700',
  },
  contact: {
    label: 'İletişim Mesajı',
    Icon: MessageSquare,
    iconWrap: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-600',
  },
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api
      .get('/applications')
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    filter === 'all' ? applications : applications.filter((a) => a.type === filter)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Başvurular</h1>
        <p className="text-gray-500">
          Influencer, marka ve iletişim formlarından gelen kayıtlar.
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'influencer', label: 'Influencer' },
          { key: 'brand', label: 'Marka' },
          { key: 'contact', label: 'İletişim' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-red-200 hover:bg-red-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center text-gray-500">
          Henüz başvuru yok.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const meta = typeMeta[app.type] || typeMeta.contact
            const title =
              app.type === 'influencer'
                ? app.name
                : app.type === 'brand'
                  ? app.company
                  : app.name

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
                    <p className="text-xs text-gray-500">{formatDate(app.createdAt)}</p>
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
