import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ACCEPTED, getConsent, subscribeConsent } from './consent.js'

export const GA_MEASUREMENT_ID = 'G-KVP8LZJMRN'

// Site tek sayfa uygulaması olduğu için GA'nın otomatik page_view'i işimizi
// görmüyor: sayfa başlığını src/lib/seo.js sonradan yazıyor, yazı sayfalarında
// ise API yanıtı geldikten sonra. Otomatik olay bırakılsaydı raporlara bir
// önceki sayfanın başlığı düşerdi. Bu yüzden `send_page_view: false` ile
// yapılandırıyoruz ve ilk yükleme dahil tüm page_view olayları buradan
// gönderiliyor.
//
// Olayı rota değişimine değil, başlığın yazıldığı ana bağlıyoruz — sıralama
// varsayımı yapmıyoruz, hangisi önce olursa olsun adres başına tek olay gider.

// Sayfa hiç useSeo çağırmazsa olay büsbütün kaybolmasın diye emniyet süresi.
// Bu süre dolduğunda başlık o anki haliyle kaydedilir; eksik başlık, eksik
// sayfa görüntülemesinden iyidir.
const FALLBACK_MS = 4000

// En son page_view gönderdiğimiz adres. useSeo bir sayfada birden çok kez
// çalışabildiği için (veri geldikçe başlık güncellenir) tekrarı bu engelliyor.
let sentKey = null
let fallbackTimer = null
// SPA içi geçişlerde GA önceki adresi bilemez, page_referrer'ı biz veriyoruz.
let lastLocation = null

function gtag() {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(arguments)
}

// gtag betiği index.html'de değil burada yükleniyor: ziyaretçi çerez bandında
// onay vermeden Google'a hiçbir istek gitmemeli. Onay verildiğinde betik bir
// kez eklenir, sonraki çağrılar aynı betiği kullanır.
let gtagLoaded = false

function loadGtag() {
  if (gtagLoaded) return
  gtagLoaded = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // Betik yüklenmeden önce yapılan çağrılar dataLayer'da sıraya girer; GA bu
  // kuyruğu yüklendiğinde işler.
  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
}

// Onay geri alındığında ölçümü durdurmak yetmez, daha önce yazılmış GA
// çerezleri de silinmeli; aksi halde tanımlayıcı tarayıcıda kalmaya devam eder.
function stopTracking() {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true

  const { hostname } = window.location
  const expired = 'Thu, 01 Jan 1970 00:00:01 GMT'
  document.cookie.split('; ').forEach((entry) => {
    const name = entry.split('=')[0]
    if (!name.startsWith('_ga')) return
    // Çerezin hangi alan adıyla yazıldığını bilmediğimiz için üç olasılığı da
    // deniyoruz; yanlış olan denemeler etkisiz kalır.
    document.cookie = `${name}=; expires=${expired}; path=/`
    document.cookie = `${name}=; expires=${expired}; path=/; domain=${hostname}`
    document.cookie = `${name}=; expires=${expired}; path=/; domain=.${hostname}`
  })
}

function currentKey() {
  return window.location.pathname + window.location.search
}

function clearFallback() {
  if (fallbackTimer === null) return
  clearTimeout(fallbackTimer)
  fallbackTimer = null
}

function send() {
  // Onay yoksa olay ne gönderilir ne de "gönderildi" diye işaretlenir:
  // ziyaretçi sonradan onay verirse o an açık olan sayfa da kaydedilebilsin.
  if (getConsent() !== ACCEPTED) return

  const key = currentKey()
  if (key === sentKey) return
  sentKey = key
  clearFallback()

  loadGtag()

  const location = window.location.href
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: location,
    // İlk yüklemede page_referrer'ı GA zaten document.referrer'dan alıyor;
    // yalnızca site içi geçişlerde elle veriyoruz.
    ...(lastLocation ? { page_referrer: lastLocation } : {}),
  })
  lastLocation = location
}

// Tercih bant üzerinden değiştiğinde: onay verildiyse o anda açık olan sayfanın
// görüntülemesi gönderilir, geri alındıysa ölçüm durdurulup çerezler silinir.
if (typeof window !== 'undefined') {
  subscribeConsent((value) => {
    if (value !== ACCEPTED) {
      stopTracking()
      return
    }
    // Önce reddedip sonra onay veren ziyaretçide engel bayrağı kalkmalı.
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false
    send()
  })
}

// useSeo, document.title'ı yazdıktan sonra burayı çağırır.
export function reportSeoApplied() {
  if (typeof window === 'undefined') return
  send()
}

// Rota değişimini yalnızca tetikleyici olarak kullanıyoruz; adresi her zaman
// window.location'dan okuyoruz ki reportSeoApplied ile aynı anahtarı üretelim.
export function usePageViews() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (currentKey() === sentKey) return
    clearFallback()
    fallbackTimer = setTimeout(() => {
      fallbackTimer = null
      send()
    }, FALLBACK_MS)

    return clearFallback
  }, [pathname, search])
}
