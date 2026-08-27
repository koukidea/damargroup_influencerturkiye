import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, Calendar, ArrowLeft, ArrowRight, ChevronRight, Eye, User, RefreshCw } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useSeo, absoluteUrl, SITE_NAME, DEFAULT_IMAGE } from '../lib/seo.js'
import { toPlainText, truncate } from '../lib/contentFormat.js'
import { resolveCategory, resourcePath, formatDate, RESOURCES_INDEX_PATH } from '../lib/resources.js'
import ArticleContent from '../components/resources/ArticleContent.jsx'
import ShareButtons from '../components/resources/ShareButtons.jsx'
import ResourceCard from '../components/resources/ResourceCard.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function ResourceDetailPage() {
  const { slug } = useParams()
  const { resourceCategories, getResource, trackResourceView } = useData()

  const [item, setItem] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | missing | error
  const [error, setError] = useState('')
  const viewedSlugs = useRef(new Set())

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setItem(null)
    window.scrollTo(0, 0)

    getResource(slug)
      .then((data) => {
        if (cancelled) return
        setItem(data)
        setStatus('ready')
        // Aynı yazı aynı oturumda birden fazla sayılmasın.
        if (!viewedSlugs.current.has(slug)) {
          viewedSlugs.current.add(slug)
          trackResourceView(slug)
        }
      })
      .catch((err) => {
        if (cancelled) return
        // API "Bulunamadı." dönerse bu bir 404; başka bir hata ise sunucu sorunu.
        if (err.message === 'Bulunamadı.') {
          setStatus('missing')
        } else {
          setError(err.message)
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug, getResource, trackResourceView])

  if (status === 'loading') return <ArticleSkeleton />
  if (status === 'missing') {
    return (
      <NotFoundPage
        title="Yazı bulunamadı"
        message="Bu adreste yayınlanmış bir yazı yok. Adres değişmiş olabilir — tüm yazılara göz atabilirsiniz."
      />
    )
  }
  if (status === 'error') {
    return (
      <NotFoundPage
        title="Yazı yüklenemedi"
        message={`Sunucuya şu anda ulaşılamıyor (${error}). Lütfen sayfayı yenileyip tekrar deneyin.`}
      />
    )
  }

  return <Article item={item} categories={resourceCategories} />
}

function Article({ item, categories }) {
  // Kategori bilgisi detay yanıtıyla birlikte geliyor; genel liste henüz
  // yüklenmemiş olsa bile başlık ve renkler doğru görünsün.
  const category = resolveCategory(
    item.categoryDetail ? [item.categoryDetail, ...categories] : categories,
    item.category
  )
  const { Icon } = category

  const url = absoluteUrl(resourcePath(item.slug))
  const description = item.seoDescription || item.excerpt || truncate(toPlainText(item.content), 160)
  const image = item.coverImage || DEFAULT_IMAGE

  useSeo({
    title: item.seoTitle || item.title,
    description,
    canonical: resourcePath(item.slug),
    image,
    imageAlt: item.coverAlt || item.title,
    type: 'article',
    robots: item.status === 'draft' ? 'noindex, nofollow' : undefined,
    publishedTime: item.date ? new Date(item.date).toISOString() : undefined,
    modifiedTime: item.updatedAt || undefined,
    author: item.author,
    tags: item.tags,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: item.title,
        description,
        image: [absoluteUrl(image)],
        datePublished: item.date,
        dateModified: item.updatedAt ? item.updatedAt.slice(0, 10) : item.date,
        author: { '@type': 'Organization', name: item.author || SITE_NAME },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.svg') },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        articleSection: category.label,
        keywords: item.tags.join(', ') || undefined,
        inLanguage: 'tr-TR',
      },
      // Google arama sonucunda "Anasayfa › Kaynaklar › Yazı" kırıntısını gösterir.
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Kaynaklar', item: absoluteUrl(RESOURCES_INDEX_PATH) },
          { '@type': 'ListItem', position: 3, name: item.title, item: url },
        ],
      },
    ],
  })

  return (
    <>
      {item.status === 'draft' && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-sm text-amber-800 text-center">
          Bu yazı <strong>taslak</strong> durumunda — yalnızca yöneticiler görebilir, arama
          motorlarına kapalıdır.
        </div>
      )}

      <section className="bg-white pt-8 pb-6 px-6">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Konum" className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-red-600 transition-colors">
              Anasayfa
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link to={RESOURCES_INDEX_PATH} className="hover:text-red-600 transition-colors">
              Kaynaklar
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900 font-medium truncate">{item.title}</span>
          </nav>

          <Link
            to={`${RESOURCES_INDEX_PATH}?kategori=${category.slug}`}
            className="inline-flex items-center gap-2 mb-4 group"
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.bg }}
            >
              <Icon className="w-4 h-4" style={{ color: category.color }} />
            </span>
            <span
              className="text-xs font-semibold uppercase tracking-wider group-hover:underline"
              style={{ color: category.color }}
            >
              {category.label}
            </span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
            {item.title}
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-6">{item.excerpt}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 pb-6 border-b border-gray-200">
            {item.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {item.author}
              </span>
            )}
            <time dateTime={item.date} className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(item.date)}
            </time>
            {item.updatedAt && (
              <span className="flex items-center gap-1.5" title="Son güncelleme">
                <RefreshCw className="w-4 h-4" />
                {formatDate(item.updatedAt)} güncellendi
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {item.readTime} okuma
            </span>
            {item.views > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {item.views.toLocaleString('tr-TR')} görüntülenme
              </span>
            )}
          </div>
        </div>
      </section>

      {item.coverImage && (
        <section className="bg-white px-6 pb-2">
          <div className="max-w-3xl mx-auto">
            <img
              src={item.coverImage}
              alt={item.coverAlt || item.title}
              className="w-full rounded-3xl border border-gray-200 object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </section>
      )}

      <section className="bg-white pt-8 pb-10 px-6">
        <div className="max-w-3xl mx-auto">
          <ArticleContent content={item.content} color={category} />

          {item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-gray-200">
              <span className="text-sm text-gray-500 mr-1">Etiketler:</span>
              {item.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`${RESOURCES_INDEX_PATH}?ara=${encodeURIComponent(tag)}`}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <Link
              to={RESOURCES_INDEX_PATH}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tüm Kaynaklar
            </Link>
            <ShareButtons url={url} title={item.title} />
          </div>
        </div>
      </section>

      <section className="bg-red-600 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Bu Konuda Uzman Desteği mi Gerekiyor?
          </h2>
          <p className="text-red-50 mb-8">
            {category.label} alanındaki ihtiyacınızı birlikte konuşalım.
          </p>
          <Link
            to="/iletisim"
            className="group inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl"
          >
            İletişime Geç
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {item.related?.length > 0 && (
        <section className="bg-gray-50 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">İlgili Yazılar</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {item.related.map((related) => (
                <ResourceCard key={related.id} item={related} categories={categories} compact />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

// Veri gelene kadar gösterilen iskelet. Eskiden bu anda kullanıcı listeye geri
// atılıyordu; artık yazı yüklenene kadar bekliyoruz.
function ArticleSkeleton() {
  return (
    <section className="bg-white pt-8 pb-16 px-6">
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-3 w-56 bg-gray-200 rounded mb-8" />
        <div className="h-6 w-40 bg-gray-200 rounded mb-5" />
        <div className="h-9 w-full bg-gray-200 rounded mb-3" />
        <div className="h-9 w-3/4 bg-gray-200 rounded mb-6" />
        <div className="h-4 w-full bg-gray-100 rounded mb-2" />
        <div className="h-4 w-5/6 bg-gray-100 rounded mb-8" />
        <div className="h-px w-full bg-gray-200 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={`h-4 bg-gray-100 rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
