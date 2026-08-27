import { useEffect } from 'react'
import { reportSeoApplied } from './analytics.js'

export const SITE_NAME = 'Influencer Türkiye'
export const DEFAULT_DESCRIPTION =
  "Influencer Türkiye — markaları doğru influencer'larla buluşturan, kampanyayı stratejiden raporlamaya kadar yöneten dijital pazarlama ajansı."
export const DEFAULT_IMAGE = '/logo.svg'

// Site tek sayfa uygulaması (SPA) olduğu için her sayfanın başlığı ve meta
// etiketleri JavaScript ile güncelleniyor. Google JS çalıştırdığı için bu
// yaklaşım arama sonuçlarında doğru başlığı gösterir.
//
// `data-seo="1"` işareti, bu dosyanın oluşturduğu etiketleri index.html'deki
// sabit etiketlerden ayırır; sayfa değişiminde yalnızca kendi etiketlerimizi
// temizliyoruz.

export function absoluteUrl(path = '/') {
  if (!path) return typeof window === 'undefined' ? '' : window.location.origin
  if (/^https?:\/\//i.test(path)) return path
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
}

function setMeta(selectorAttr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${selectorAttr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(selectorAttr, key)
    el.setAttribute('data-seo', '1')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(selectorAttr, key) {
  document.head
    .querySelectorAll(`meta[${selectorAttr}="${key}"]`)
    .forEach((el) => el.remove())
}

function setLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute('data-seo', '1')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(data) {
  document.head.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove())
  if (!data) return
  const list = Array.isArray(data) ? data : [data]
  list.filter(Boolean).forEach((entry, index) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-seo-jsonld', String(index))
    script.textContent = JSON.stringify(entry)
    document.head.appendChild(script)
  })
}

export function useSeo(options) {
  // Nesne her render'da yeniden oluştuğu için bağımlılık olarak içeriğini
  // kullanıyoruz; aksi halde effect sonsuz döngüye girer.
  const key = JSON.stringify(options ?? {})

  useEffect(() => {
    const {
      title,
      description = DEFAULT_DESCRIPTION,
      canonical,
      image = DEFAULT_IMAGE,
      imageAlt,
      type = 'website',
      robots,
      jsonLd,
      publishedTime,
      modifiedTime,
      author,
      tags = [],
      appendSiteName = true,
    } = JSON.parse(key)

    const fullTitle = title
      ? appendSiteName
        ? `${title} | ${SITE_NAME}`
        : title
      : `${SITE_NAME} | Influencer Marketing ve Dijital Pazarlama Ajansı`
    const url = absoluteUrl(canonical || window.location.pathname + window.location.search)
    const imageUrl = absoluteUrl(image)

    document.title = fullTitle

    setMeta('name', 'description', description)
    setLink('canonical', url)

    // Arama motoru dizinleme talimatı — yalnızca gerekliyse yazılır, aksi
    // halde eskiden kalmış bir "noindex" sayfaya yapışıp kalmasın diye silinir.
    if (robots) setMeta('name', 'robots', robots)
    else removeMeta('name', 'robots')

    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'tr_TR')
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', imageUrl)
    if (imageAlt) setMeta('property', 'og:image:alt', imageAlt)

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', imageUrl)

    // Makaleye özel etiketler her sayfa değişiminde sıfırlanır; aksi halde
    // bir yazıdan ana sayfaya geçince yazının tarihi orada kalırdı.
    removeMeta('property', 'article:published_time')
    removeMeta('property', 'article:modified_time')
    removeMeta('property', 'article:author')
    document.head.querySelectorAll('meta[property="article:tag"]').forEach((el) => el.remove())

    if (type === 'article') {
      if (publishedTime) setMeta('property', 'article:published_time', publishedTime)
      if (modifiedTime) setMeta('property', 'article:modified_time', modifiedTime)
      if (author) setMeta('property', 'article:author', author)
      tags.forEach((tag) => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'article:tag')
        el.setAttribute('content', tag)
        el.setAttribute('data-seo', '1')
        document.head.appendChild(el)
      })
    }

    setJsonLd(jsonLd)

    // Başlık artık doğru; GA page_view olayını bu andan sonra göndersin.
    reportSeoApplied()
  }, [key])
}

// Sayfa değiştiğinde en üste dönmek her sayfada tekrarlanan bir ihtiyaç.
export function useScrollTop(dep) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [dep])
}
