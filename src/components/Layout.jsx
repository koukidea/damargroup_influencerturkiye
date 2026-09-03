import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import WhatsAppButton from './WhatsAppButton.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import DataStatusBanner from './DataStatusBanner.jsx'
import CookieBanner from './CookieBanner.jsx'
import RouteFallback from './RouteFallback.jsx'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Header />
      <DataStatusBanner />
      {/* Sayfa parçası inerken başlık ve footer ekranda kalsın diye sınır
          burada; App'teki dıştaki Suspense'e düşseydi tüm çerçeve kaybolurdu. */}
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </div>
  )
}
