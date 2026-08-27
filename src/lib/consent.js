import { useSyncExternalStore } from 'react'

// Zorunlu olmayan çerezlerin (Google Analytics) ziyaretçi onayına bağlanması.
// Onay verilene kadar gtag betiği hiç yüklenmiyor — "reddet" diyen ya da hiç
// yanıt vermeyen ziyaretçiden ölçüm verisi toplanmıyor.

const STORAGE_KEY = 'it_cookie_consent'

// Tercih, hangi metne verildiğiyle birlikte saklanıyor. Aydınlatma metni ya da
// kullanılan çerezler esaslı biçimde değişirse bu değer güncellenmeli: eski
// sürüme verilen yanıtlar geçersiz sayılır ve bant yeniden gösterilir.
export const CONSENT_VERSION = '2026-08-27'

export const ACCEPTED = 'accepted'
export const REJECTED = 'rejected'

const listeners = new Set()

// Depolamayı her okumada ayrıştırmamak için bellekte tutuyoruz. undefined =
// "henüz okunmadı", null = "tercih yok".
let cached

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    if (saved?.version !== CONSENT_VERSION) return null
    return saved.value === ACCEPTED || saved.value === REJECTED ? saved.value : null
  } catch {
    // Gizli sekmede ya da depolama kapalıyken okuma hata verebilir. Böyle bir
    // durumda tercih yok sayılır: bant yeniden sorar, ölçüm yapılmaz.
    return null
  }
}

export function getConsent() {
  if (typeof window === 'undefined') return null
  if (cached === undefined) cached = readStorage()
  return cached
}

function publish(value) {
  cached = value
  listeners.forEach((listener) => listener(value))
}

export function setConsent(value) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ value, version: CONSENT_VERSION, date: new Date().toISOString() })
    )
  } catch {
    // Depolama yazılamıyorsa tercih yalnızca açık olan sekme için geçerli olur.
  }
  publish(value)
}

// Footer'daki "Çerez Tercihleri" bağlantısı bunu çağırıyor: kayıt siliniyor,
// bant yeniden çıkıyor ve yeni bir yanıt verilene kadar ölçüm duruyor. Onayın
// geri alınabilmesi KVKK m.5/1 gereği.
export function clearConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Yukarıdaki ile aynı: depolama yoksa bellekteki değer yeterli.
  }
  publish(null)
}

export function subscribeConsent(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Sunucu tarafında render edilmediğimiz için getServerSnapshot da null döner.
export function useConsent() {
  return useSyncExternalStore(subscribeConsent, getConsent, () => null)
}
