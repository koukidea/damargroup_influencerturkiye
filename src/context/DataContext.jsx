import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, buildQuery } from '../lib/api.js'

const DataContext = createContext(null)

// Buradaki fonksiyonların hepsi useCallback ile sabitleniyor ve `value` useMemo
// ile paketleniyor. Sebebi görsel: sayfalar bu fonksiyonları useEffect bağımlılığı
// olarak kullanıyor (örn. ResourceDetailPage → getResource). Her render'da yeni
// birer fonksiyon üretilseydi, provider kendi ilk yüklemesini bitirip yeniden
// render olduğunda effect tekrar çalışır, açık olan yazı bir anlığına iskelete
// dönüp yeniden indirilirdi.
export function DataProvider({ children }) {
  const [influencers, setInfluencers] = useState([])
  const [portfolioCreators, setPortfolioCreators] = useState([])
  const [services, setServices] = useState([])
  const [resourceCategories, setResourceCategories] = useState([])
  // Yazı listesi artık burada tutulmuyor: her sayfa ihtiyacı kadarını çekiyor.
  // Tüm makale metinlerinin her sayfa açılışında indirilmesi bu yüzden bitti.
  const [latestResources, setLatestResources] = useState([])
  const [resourceCount, setResourceCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshResourceSummary = useCallback(async () => {
    const [latest, page] = await Promise.all([
      api.get('/resources/latest?limit=3'),
      api.get('/resources?limit=1'),
    ])
    setLatestResources(latest)
    setResourceCount(page.total)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [inf, creators, svc, cats, latest, page] = await Promise.all([
          api.get('/influencers'),
          api.get('/portfolio-creators'),
          api.get('/services'),
          api.get('/resources/categories'),
          api.get('/resources/latest?limit=3'),
          api.get('/resources?limit=1'),
        ])
        if (cancelled) return
        setInfluencers(inf)
        setPortfolioCreators(creators)
        setServices(svc)
        setResourceCategories(cats)
        setLatestResources(latest)
        setResourceCount(page.total)
        setError('')
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  /* --------------------------------- Influencers -------------------------------- */

  const addInfluencer = useCallback(async (data) => {
    const created = await api.post('/influencers', data)
    setInfluencers((prev) => [...prev, created])
  }, [])

  const updateInfluencer = useCallback(async (id, data) => {
    const updated = await api.put(`/influencers/${id}`, data)
    setInfluencers((prev) => prev.map((i) => (i.id === id ? updated : i)))
  }, [])

  const removeInfluencer = useCallback(async (id) => {
    await api.del(`/influencers/${id}`)
    setInfluencers((prev) => prev.filter((i) => i.id !== id))
  }, [])

  /* ---------------------- Portföy galerisi (içerik üreticileri) --------------------- */

  const addPortfolioCreator = useCallback(async (data) => {
    const created = await api.post('/portfolio-creators', data)
    setPortfolioCreators((prev) => [...prev, created])
  }, [])

  const updatePortfolioCreator = useCallback(async (id, data) => {
    const updated = await api.put(`/portfolio-creators/${id}`, data)
    setPortfolioCreators((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }, [])

  const removePortfolioCreator = useCallback(async (id) => {
    await api.del(`/portfolio-creators/${id}`)
    setPortfolioCreators((prev) => prev.filter((c) => c.id !== id))
  }, [])

  /* ---------------------------------- Hizmetler --------------------------------- */

  const addService = useCallback(async (data) => {
    const created = await api.post('/services', data)
    setServices((prev) => [...prev, created])
  }, [])

  const updateService = useCallback(async (id, data) => {
    const updated = await api.put(`/services/${id}`, data)
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }, [])

  const removeService = useCallback(async (id) => {
    await api.del(`/services/${id}`)
    setServices((prev) => prev.filter((s) => s.id !== id))
  }, [])

  /* ------------------------- Kaynaklar — liste ve detay -------------------------- */

  const listResources = useCallback((params) => api.get(`/resources${buildQuery(params)}`), [])

  const getResource = useCallback((slug) => api.get(`/resources/${encodeURIComponent(slug)}`), [])

  const trackResourceView = useCallback(
    (slug) => api.post(`/resources/${encodeURIComponent(slug)}/view`).catch(() => {}),
    []
  )

  const addResource = useCallback(
    async (data) => {
      const created = await api.post('/resources', data)
      await refreshResourceSummary()
      return created
    },
    [refreshResourceSummary]
  )

  const updateResource = useCallback(
    async (id, data) => {
      const updated = await api.put(`/resources/${id}`, data)
      await refreshResourceSummary()
      return updated
    },
    [refreshResourceSummary]
  )

  const removeResource = useCallback(
    async (id) => {
      await api.del(`/resources/${id}`)
      await refreshResourceSummary()
    },
    [refreshResourceSummary]
  )

  /* ------------------------------ Kaynak kategorileri ----------------------------- */

  const addResourceCategory = useCallback(async (data) => {
    const created = await api.post('/resources/categories', data)
    setResourceCategories((prev) => [...prev, created])
    return created
  }, [])

  const updateResourceCategory = useCallback(async (id, data) => {
    const updated = await api.put(`/resources/categories/${id}`, data)
    setResourceCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }, [])

  const removeResourceCategory = useCallback(async (id) => {
    await api.del(`/resources/categories/${id}`)
    setResourceCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      loading,
      error,

      // Influencers
      influencers,
      addInfluencer,
      updateInfluencer,
      removeInfluencer,

      // Portföy galerisi (içerik üreticileri)
      portfolioCreators,
      addPortfolioCreator,
      updatePortfolioCreator,
      removePortfolioCreator,

      // Services
      services,
      addService,
      updateService,
      removeService,

      // Kaynaklar — liste ve detay çağrıları
      latestResources,
      resourceCount,
      listResources,
      getResource,
      trackResourceView,
      addResource,
      updateResource,
      removeResource,

      // Kaynak kategorileri
      resourceCategories,
      addResourceCategory,
      updateResourceCategory,
      removeResourceCategory,
    }),
    [
      loading,
      error,
      influencers,
      addInfluencer,
      updateInfluencer,
      removeInfluencer,
      portfolioCreators,
      addPortfolioCreator,
      updatePortfolioCreator,
      removePortfolioCreator,
      services,
      addService,
      updateService,
      removeService,
      latestResources,
      resourceCount,
      listResources,
      getResource,
      trackResourceView,
      addResource,
      updateResource,
      removeResource,
      resourceCategories,
      addResourceCategory,
      updateResourceCategory,
      removeResourceCategory,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
