import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import RouteFallback from './components/RouteFallback.jsx'
import { resourcePath } from './lib/resources.js'
import { usePageViews } from './lib/analytics.js'

// Sayfalar rota bazlı ayrı parçalara bölünüyor: ziyaretçi yalnızca açtığı
// sayfanın kodunu indiriyor. En büyük kazanç yönetim panelinde — normal bir
// ziyaretçi o kodu hiç görmüyor. Swiper da yalnızca HomePage'de kullanıldığı
// için artık ana sayfaya girmeyenlere inmiyor.
//
// Layout, Header ve Footer bilerek statik: her sayfada gerekliler, ayrı parça
// yapmak fazladan bir istek anlamına gelirdi.
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'))
const PortfolioPage = lazy(() => import('./pages/PortfolioPage.jsx'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage.jsx'))
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'))
const KVKKPage = lazy(() => import('./pages/KVKKPage.jsx'))
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage.jsx'))
const ApplicationPage = lazy(() => import('./pages/ApplicationPage.jsx'))
const InfluencerApplicationPage = lazy(() => import('./pages/InfluencerApplicationPage.jsx'))
const BrandApplicationPage = lazy(() => import('./pages/BrandApplicationPage.jsx'))

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'))
const AdminInfluencersPage = lazy(() => import('./pages/admin/AdminInfluencersPage.jsx'))
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage.jsx'))
const AdminResourcesPage = lazy(() => import('./pages/admin/AdminResourcesPage.jsx'))
const AdminResourceCategoriesPage = lazy(() => import('./pages/admin/AdminResourceCategoriesPage.jsx'))
const AdminApplicationsPage = lazy(() => import('./pages/admin/AdminApplicationsPage.jsx'))

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
    // Bu dıştaki Suspense yalnızca Layout'un kendisi askıya alındığında —
    // yani yönetim panelinde — devreye giriyor. Genel sayfalarda React en
    // yakın sınırı seçtiği için Layout içindeki Suspense kazanıyor ve
    // başlık/footer ekranda kalıyor.
    <Suspense fallback={<RouteFallback />}>
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

          {/* Statik site alışkanlığından kalan giriş dosyaları. Nginx bunları
              SPA fallback'i sayesinde 200 ile veriyor, ama aşağıdaki /:slug
              kuralına düşüp "yazı bulunamadı" ekranı çıkıyordu. Ana sayfaya
              yönlendiriyoruz. */}
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="/index.htm" element={<Navigate to="/" replace />} />
          <Route path="/index.php" element={<Navigate to="/" replace />} />

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
          {/* Portföy galerisi artık influencer sayfasından yönetiliyor; eski yer imleri kırılmasın. */}
          <Route path="portfoy" element={<Navigate to="/admin/influencerlar" replace />} />
          <Route path="hizmetler" element={<AdminServicesPage />} />
          <Route path="kaynaklar" element={<AdminResourcesPage />} />
          <Route path="kaynak-kategorileri" element={<AdminResourceCategoriesPage />} />
          <Route path="basvurular" element={<AdminApplicationsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
