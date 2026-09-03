import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Briefcase, Newspaper, Inbox, ArrowRight } from 'lucide-react'
import { applicationMeta, applicationTitle, relativeTime } from '../../lib/applications.js'
import { useData } from '../../context/DataContext.jsx'
import { api } from '../../lib/api.js'

export default function AdminDashboardPage() {
  const { influencers, services, resourceCount } = useData()
  const [applications, setApplications] = useState(null)

  useEffect(() => {
    api
      .get('/applications')
      .then(setApplications)
      .catch(() => setApplications([]))
  }, [])

  const applicationCount = applications ? applications.length : null
  // API en yeniden eskiye sıralı döndürüyor.
  const recentApplications = (applications || []).slice(0, 5)

  const cards = [
    {
      to: '/admin/influencerlar',
      label: "Influencer'lar",
      count: influencers.length,
      Icon: Users,
      desc: 'Anasayfa kartlarını ve portföy galerisini tek yerden yönetin.',
    },
    {
      to: '/admin/hizmetler',
      label: 'Hizmetler',
      count: services.length,
      Icon: Briefcase,
      desc: 'Hizmetlerimiz sayfasındaki kategorileri yönetin.',
    },
    {
      to: '/admin/kaynaklar',
      label: 'Kaynaklar',
      count: resourceCount,
      Icon: Newspaper,
      desc: 'Kaynaklar bölümündeki yazıları yönetin.',
    },
    {
      to: '/admin/basvurular',
      label: 'Başvurular',
      count: applicationCount ?? '–',
      Icon: Inbox,
      desc: 'Influencer ve marka başvuru formu kayıtlarını görüntüleyin.',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Yönetim Paneli</h1>
      <p className="text-gray-500 mb-8">Site içeriğini buradan yönetebilirsiniz.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(({ to, label, count, Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white border border-gray-200 rounded-3xl p-6 hover:border-red-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <Icon className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{count}</span>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">{label}</h2>
            <p className="text-sm text-gray-500 mb-4">{desc}</p>
            <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium group-hover:gap-2 transition-all">
              Yönet <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Son Başvurular</h2>
            <p className="text-sm text-gray-500">Formlardan gelen en yeni kayıtlar.</p>
          </div>
          <Link
            to="/admin/basvurular"
            className="inline-flex items-center gap-1 text-sm text-red-600 font-medium hover:gap-2 transition-all"
          >
            Tümünü gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
          {applications === null ? (
            <p className="text-center text-gray-500 py-10">Yükleniyor…</p>
          ) : recentApplications.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Henüz başvuru yok.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentApplications.map((app) => {
                const meta = applicationMeta(app.type)
                return (
                  <li key={app.id}>
                    <Link
                      to="/admin/basvurular"
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.iconWrap}`}
                      >
                        <meta.Icon className={`w-4 h-4 ${meta.iconColor}`} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-gray-900 truncate">
                          {applicationTitle(app) || '—'}
                        </span>
                        <span className="block text-xs text-gray-500 truncate">
                          {app.email}
                          {app.type === 'contact' && app.subject ? ` · ${app.subject}` : ''}
                          {app.type === 'brand' && app.sector ? ` · ${app.sector}` : ''}
                          {app.type === 'influencer' && app.category ? ` · ${app.category}` : ''}
                        </span>
                      </span>
                      <span
                        className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${meta.badge}`}
                      >
                        {meta.short}
                      </span>
                      <span
                        className="text-xs text-gray-400 whitespace-nowrap w-24 text-right"
                        title={new Date(app.createdAt).toLocaleString('tr-TR')}
                      >
                        {relativeTime(app.createdAt)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
