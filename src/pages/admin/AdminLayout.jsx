import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
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
  KeyRound,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSeo } from '../../lib/seo.js'
import DataStatusBanner from '../../components/DataStatusBanner.jsx'
import ChangePasswordModal from '../../components/admin/ChangePasswordModal.jsx'

const navItems = [
  { to: '/admin', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
  { to: '/admin/influencerlar', label: "Influencer'lar", icon: Users },
  { to: '/admin/hizmetler', label: 'Hizmetler', icon: Briefcase },
  { to: '/admin/kaynaklar', label: 'Kaynaklar', icon: Newspaper },
  { to: '/admin/kaynak-kategorileri', label: 'Kategoriler', icon: Tags },
  { to: '/admin/basvurular', label: 'Başvurular', icon: Inbox },
]

// Kenar çubuğu geniş ekranda (lg ve üstü) sabit; daha dar ekranlarda üst
// çubuktaki menü düğmesiyle soldan açılan bir çekmeceye dönüşür. Çekmece
// sayfa değişince, Esc'de ve karartılmış alana dokununca kapanır.
export default function AdminLayout() {
  // Yönetim paneli hiçbir koşulda arama sonuçlarında görünmemeli.
  useSeo({ title: 'Yönetim Paneli', robots: 'noindex, nofollow' })
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobil üst çubuk */}
      <header className="lg:hidden sticky top-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Influencer Türkiye" className="h-6 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="p-2 -mr-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Menüyü aç"
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Çekmece arkası karartma (yalnızca mobil, menü açıkken) */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/50"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:w-64 lg:max-w-none bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="h-14 lg:h-16 flex items-center justify-between px-5 lg:px-6 border-b border-gray-200 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Influencer Türkiye" className="h-6 lg:h-7 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="lg:hidden p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Menüyü kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

        <div className="p-4 border-t border-gray-200 space-y-1 shrink-0">
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
            onClick={() => {
              setMenuOpen(false)
              setShowPassword(true)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            Şifre Değiştir
          </button>
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

      <ChangePasswordModal open={showPassword} onClose={() => setShowPassword(false)} />

      {/* min-w-0: içerik en dar genişliğinin altına inebilsin; aksi hâlde uzun
          başlık satırları tüm paneli yatayda taşırıyordu. */}
      <main className="min-w-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <DataStatusBanner />
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
