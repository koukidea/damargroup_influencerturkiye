import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Images, Briefcase, Newspaper, Inbox, ArrowRight } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import { api } from '../../lib/api.js'

export default function AdminDashboardPage() {
  const { influencers, portfolioCreators, services, resourceCount } = useData()
  const [applicationCount, setApplicationCount] = useState(null)

  useEffect(() => {
    api
      .get('/applications')
      .then((rows) => setApplicationCount(rows.length))
      .catch(() => setApplicationCount(0))
  }, [])

  const cards = [
    {
      to: '/admin/influencerlar',
      label: "Influencer'lar",
      count: influencers.length,
      Icon: Users,
      desc: 'Anasayfada gösterilen influencer kartlarını yönetin.',
    },
    {
      to: '/admin/portfoy',
      label: 'Portföy Galerisi',
      count: portfolioCreators.length,
      Icon: Images,
      desc: 'Portföy sayfasındaki içerik üretici galerisini yönetin.',
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
    </div>
  )
}
