import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import WhatsAppButton from './WhatsAppButton.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import DataStatusBanner from './DataStatusBanner.jsx'
import CookieBanner from './CookieBanner.jsx'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Header />
      <DataStatusBanner />
      <Outlet />
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </div>
  )
}
