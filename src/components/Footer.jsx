import { Link } from 'react-router-dom'
import { Phone, Mail } from 'lucide-react'
import { InstagramIcon, LinkedinIcon, XIcon } from './BrandIcons.jsx'
import { clearConsent } from '../lib/consent.js'

const footerLinks = [
  { to: '/', label: 'Anasayfa' },
  { to: '/hizmetlerimiz', label: 'Hizmetlerimiz' },
  { to: '/portfolyo', label: 'Portföy' },
  { to: '/kaynaklar', label: 'Kaynaklar' },
  { to: '/basvuru', label: 'Başvuru' },
  { to: '/iletisim', label: 'İletişim' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-16 pb-8 px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-200">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div
                className="rounded-lg flex items-center justify-center overflow-hidden"
                style={{ width: 175, height: 100, aspectRatio: '7 / 4' }}
              >
                <img
                  alt="Influencer Türkiye Logo"
                  className="w-full h-full object-contain"
                  src="/logo.svg"
                />
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-8 text-sm max-w-md">
              Türkiye'nin en kapsamlı influencer marketing platformu.
              Markalar ve influencer'ları bir araya getiriyoruz.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/influencerturkiyeofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/influenturkiye"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              >
                <XIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/influencer-türki̇ye"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-8 text-xl">Sayfalar</h4>
            <ul className="space-y-3">
              {footerLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-8 text-xl">İletişim</h4>
            <div className="space-y-6">
              <a
                href="tel:+905558773534"
                className="flex items-start gap-4 text-gray-600 hover:text-red-600 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-red-600 group-hover:border-red-600 group-hover:bg-red-50 transition-all shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-red-600 mb-1">
                    Telefon
                  </div>
                  <div className="text-base font-medium">0 (555) 877 35 34</div>
                </div>
              </a>
              <a
                href="mailto:hello@influencerturkiye.com"
                className="flex items-start gap-4 text-gray-600 hover:text-red-600 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-red-600 group-hover:border-red-600 group-hover:bg-red-50 transition-all shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-red-600 mb-1">
                    E-posta
                  </div>
                  <div className="text-base font-medium break-all">
                    hello@influencerturkiye.com
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 Influencer Türkiye - Tüm hakları saklıdır.
          </p>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <Link
              to="/kvkk"
              className="text-gray-600 hover:text-red-600 transition-colors text-sm"
            >
              KVKK
            </Link>
            <Link
              to="/cerez-politikasi"
              className="text-gray-600 hover:text-red-600 transition-colors text-sm"
            >
              Çerez Politikası
            </Link>
            {/* Kaydı siler; çerez bandı yeniden çıkar ve yeni bir yanıt
                verilene kadar analitik ölçüm durur. */}
            <button
              type="button"
              onClick={clearConsent}
              className="text-gray-600 hover:text-red-600 transition-colors text-sm text-left md:text-center cursor-pointer"
            >
              Çerez Tercihleri
            </button>
            <p className="text-gray-600 text-sm">
              Designed by{' '}
              <a
                href="https://damargroup.tr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 hover:underline transition-colors font-medium"
              >
                Damar Group
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
