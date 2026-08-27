import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import HomePage from './pages/HomePage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import PortfolioPage from './pages/PortfolioPage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'
import ResourceDetailPage from './pages/ResourceDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import KVKKPage from './pages/KVKKPage.jsx'
import CookiePolicyPage from './pages/CookiePolicyPage.jsx'
import ApplicationPage from './pages/ApplicationPage.jsx'
import InfluencerApplicationPage from './pages/InfluencerApplicationPage.jsx'
import BrandApplicationPage from './pages/BrandApplicationPage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AdminInfluencersPage from './pages/admin/AdminInfluencersPage.jsx'
import AdminPortfolioPage from './pages/admin/AdminPortfolioPage.jsx'
import AdminServicesPage from './pages/admin/AdminServicesPage.jsx'
import AdminResourcesPage from './pages/admin/AdminResourcesPage.jsx'
import AdminResourceCategoriesPage from './pages/admin/AdminResourceCategoriesPage.jsx'
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage.jsx'
import { resourcePath } from './lib/resources.js'
import { usePageViews } from './lib/analytics.js'

// Yazılar eskiden /kaynaklar/<slug> adresindeydi. Paylaşılmış bağlantılar ve
// arama motoru kayıtları kırılmasın diye yeni kök adrese yönlendiriyoruz.
function LegacyResourceRedirect() {
  const { slug } = useParams()
  return <Navigate to={resourcePath(slug)} replace />
}

function App() {
  // Rota değişimlerinde Google Analytics page_view olayını gönderir.
  usePageViews()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hizmetlerimiz" element={<ServicesPage />} />
        <Route path="/portfolyo" element={<PortfolioPage />} />
        <Route path="/kaynaklar" element={<ResourcesPage />} />
        <Route path="/kaynaklar/:slug" element={<LegacyResourceRedirect />} />
        <Route path="/iletisim" element={<ContactPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/kvkk" element={<KVKKPage />} />
        <Route path="/cerez-politikasi" element={<CookiePolicyPage />} />
        <Route path="/basvuru" element={<ApplicationPage />} />
        <Route path="/basvuru/influencer" element={<InfluencerApplicationPage />} />
        <Route path="/basvuru/marka" element={<BrandApplicationPage />} />

        {/* Blog yazıları kök adreste: /yazi-basligi
            React Router sabit yolları parametreli yola tercih ettiği için
            yukarıdaki sayfalar bu kuraldan etkilenmez. Slug çakışmasına karşı
            sunucu tarafında da koruma var (server/src/lib/slugify.js). */}
        <Route path="/:slug" element={<ResourceDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="influencerlar" element={<AdminInfluencersPage />} />
        <Route path="portfoy" element={<AdminPortfolioPage />} />
        <Route path="hizmetler" element={<AdminServicesPage />} />
        <Route path="kaynaklar" element={<AdminResourcesPage />} />
        <Route path="kaynak-kategorileri" element={<AdminResourceCategoriesPage />} />
        <Route path="basvurular" element={<AdminApplicationsPage />} />
      </Route>
    </Routes>
  )
}

export default App
