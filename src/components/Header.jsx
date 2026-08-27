import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  ChevronDown,
  Target,
  Share2,
  Users,
  Megaphone,
  TrendingUp,
  Camera,
  PenTool,
  Monitor,
  ShoppingCart,
  Film,
  Calendar,
  Lightbulb,
  GraduationCap,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { resolveCategory, RESOURCES_INDEX_PATH } from '../lib/resources.js'

const iconMap = {
  Target,
  Share2,
  Users,
  Megaphone,
  TrendingUp,
  Camera,
  PenTool,
  Monitor,
  ShoppingCart,
  Film,
  Calendar,
  Lightbulb,
  GraduationCap,
}

const navItems = [
  { to: '/', label: 'Anasayfa' },
  { to: '/hizmetlerimiz', label: 'Hizmetlerimiz', dropdown: 'services' },
  { to: '/portfolyo', label: 'Portföy' },
  { to: '/kaynaklar', label: 'Kaynaklar', dropdown: 'resources' },
  { to: '/iletisim', label: 'İletişim' },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { services, resourceCategories } = useData()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // Mobil menüde aynı anda tek bir alt menü açık kalır ('services' | 'resources' | null).
  const [mobileSubmenu, setMobileSubmenu] = useState(null)

  // Sayfa değiştiğinde menüler kapanmalı; aksi halde yönlendirmeden sonra
  // panel açık kalıp içeriği kapatıyor.
  useEffect(() => {
    setMobileOpen(false)
    setMobileSubmenu(null)
    setProfileOpen(false)
  }, [location.pathname, location.search, location.hash])

  // Panel açıkken arkadaki sayfanın kaymasını engelle.
  useEffect(() => {
    if (!mobileOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  function closeMobile() {
    setMobileOpen(false)
    setMobileSubmenu(null)
  }

  function handleLogout() {
    setProfileOpen(false)
    closeMobile()
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white px-6 py-2 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link className="flex items-center" to="/">
          <div
            className="rounded-lg flex items-center justify-center overflow-hidden"
            style={{ width: 200, height: 60, aspectRatio: '7 / 4' }}
          >
            <img
              alt="Influencer Türkiye Logo"
              className="w-full h-full object-contain"
              src="/logo.svg"
            />
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)

            if (!item.dropdown) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={`relative text-sm transition-colors duration-200 pb-1 ${
                    isActive
                      ? 'text-red-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full" />
                  )}
                </NavLink>
              )
            }

            return (
              <div key={item.to} className="relative group py-2 -my-2">
                <Link
                  to={item.to}
                  className={`relative flex items-center gap-1 text-sm transition-colors duration-200 pb-1 ${
                    isActive
                      ? 'text-red-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full" />
                  )}
                </Link>

                <div className="absolute left-0 top-full pt-3 invisible opacity-0 -translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50">
                  {item.dropdown === 'services' ? (
                    <div className="w-[560px] bg-white border border-gray-200 rounded-2xl shadow-xl p-4 grid grid-cols-2 gap-1">
                      {services.map((service) => {
                        const Icon = iconMap[service.icon]
                        return (
                          <Link
                            key={service.id}
                            to={`/hizmetlerimiz#${service.slug}`}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50 transition-colors group/item"
                          >
                            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-red-100 transition-colors">
                              {Icon && <Icon className="w-4 h-4 text-red-600" />}
                            </div>
                            <span className="text-sm text-gray-700 group-hover/item:text-red-600 leading-tight">
                              {service.title}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="w-[520px] bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
                      <div className="grid grid-cols-2 gap-1">
                        {resourceCategories.map((raw) => {
                          const category = resolveCategory(resourceCategories, raw.slug)
                          const { Icon } = category
                          return (
                            <Link
                              key={raw.slug}
                              to={`${RESOURCES_INDEX_PATH}?kategori=${raw.slug}`}
                              className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50 transition-colors group/item"
                            >
                              <span
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: category.bg }}
                              >
                                <Icon className="w-4 h-4" style={{ color: category.color }} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-gray-800 group-hover/item:text-red-600 leading-tight">
                                  {category.label}
                                </span>
                                {raw.description && (
                                  <span className="block text-xs text-gray-500 leading-snug mt-0.5">
                                    {raw.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                      <Link
                        to={RESOURCES_INDEX_PATH}
                        className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Tüm yazılar
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-base">
                  {user.avatar}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {profileOpen && (
                <>
                  <button
                    aria-label="Kapat"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Yönetim Paneli
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                to="/auth/login"
              >
                Giriş Yap
              </Link>
              <Link
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                to="/auth/register"
              >
                Üye Ol
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobil menü: hamburger butonuyla açılır, yönlendirme sonrası otomatik kapanır. */}
      <div
        id="mobile-menu"
        className={`md:hidden ${mobileOpen ? 'block' : 'hidden'}`}
      >
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-gray-200 py-3">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            const linkClass = `block rounded-xl px-3 py-3 text-base transition-colors ${
              isActive
                ? 'text-red-600 font-semibold bg-red-50'
                : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
            }`

            if (!item.dropdown) {
              return (
                <Link key={item.to} to={item.to} onClick={closeMobile} className={linkClass}>
                  {item.label}
                </Link>
              )
            }

            const expanded = mobileSubmenu === item.dropdown

            return (
              <div key={item.to}>
                <div className="flex items-center gap-1">
                  <Link
                    to={item.to}
                    onClick={closeMobile}
                    className={`flex-1 ${linkClass}`}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileSubmenu(expanded ? null : item.dropdown)}
                    aria-label={`${item.label} alt menüsü`}
                    aria-expanded={expanded}
                    className="p-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {expanded && (
                  <div className="ml-4 pl-3 border-l border-gray-200 space-y-0.5 mb-2">
                    {item.dropdown === 'services'
                      ? services.map((service) => {
                          const Icon = iconMap[service.icon]
                          return (
                            <Link
                              key={service.id}
                              to={`/hizmetlerimiz#${service.slug}`}
                              onClick={closeMobile}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                {Icon && <Icon className="w-4 h-4 text-red-600" />}
                              </span>
                              <span className="leading-tight">{service.title}</span>
                            </Link>
                          )
                        })
                      : (
                        <>
                          {resourceCategories.map((raw) => {
                            const category = resolveCategory(resourceCategories, raw.slug)
                            const { Icon } = category
                            return (
                              <Link
                                key={raw.slug}
                                to={`${RESOURCES_INDEX_PATH}?kategori=${raw.slug}`}
                                onClick={closeMobile}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <span
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: category.bg }}
                                >
                                  <Icon className="w-4 h-4" style={{ color: category.color }} />
                                </span>
                                <span className="leading-tight">{category.label}</span>
                              </Link>
                            )
                          })}
                          <Link
                            to={RESOURCES_INDEX_PATH}
                            onClick={closeMobile}
                            className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Tüm yazılar
                          </Link>
                        </>
                      )}
                  </div>
                )}
              </div>
            )
          })}

          <Link
            to="/basvuru"
            onClick={closeMobile}
            className="block rounded-xl px-3 py-3 text-base text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            Başvuru
          </Link>

          {/* Üst bardaki giriş/profil alanı sm altında gizli olduğundan burada sunulur. */}
          <div className="sm:hidden mt-2 pt-3 border-t border-gray-200 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg">
                    {user.avatar}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900 truncate">
                      {user.name}
                    </span>
                    <span className="block text-xs text-gray-500 truncate">{user.email}</span>
                  </span>
                </div>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMobile}
                    className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Yönetim Paneli
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-1">
                <Link
                  to="/auth/login"
                  onClick={closeMobile}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/auth/register"
                  onClick={closeMobile}
                  className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3 text-center text-sm font-semibold text-white transition-all"
                >
                  Üye Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
