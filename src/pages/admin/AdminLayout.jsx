import { Suspense } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import RouteFallback from '../../components/RouteFallback.jsx'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Newspaper,
  Tags,
  Inbox,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSeo } from '../../lib/seo.js'
import DataStatusBanner from '../../components/DataStatusBanner.jsx'

const navItems = [
  { to: '/admin', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
  { to: '/admin/influencerlar', label: "Influencer'lar", icon: Users },
  { to: '/admin/hizmetler', label: 'Hizmetler', icon: Briefcase },
  { to: '/admin/kaynaklar', label: 'Kaynaklar', icon: Newspaper },
  { to: '/admin/kaynak-kategorileri', label: 'Kategoriler', icon: Tags },
  { to: '/admin/basvurular', label: 'Başvurular', icon: Inbox },
]

export default function AdminLayout() {
  // Yönetim paneli hiçbir koşulda arama sonuçlarında görünmemeli.
  useSeo({ title: 'Yönetim Paneli', robots: 'noindex, nofollow' })
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Influencer Türkiye" className="h-7 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Siteyi Görüntüle
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
          <div className="flex items-center gap-2 px-4 pt-2">
            <span className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-sm">
              {user?.avatar}
            </span>
            <span className="text-xs text-gray-500 truncate">{user?.name}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <DataStatusBanner />
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
