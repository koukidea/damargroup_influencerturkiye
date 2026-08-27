import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Tek sayfa uygulamalarında gezinme sırasında kaydırma konumu olduğu gibi kalır.
// Alt sıralardan bir menü bağlantısına tıklayan kullanıcı yeni sayfanın ortasına
// düşmesin diye yeni bir adrese gidildiğinde başa dönüyoruz.
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    // Sadece yeni bir bağlantıya tıklandığında (PUSH) başa dön:
    // POP geri/ileri tuşudur, tarayıcının hatırladığı konum korunmalı.
    // REPLACE ise sayfa içi filtre/sayfalama güncellemesidir; onların kendi
    // kaydırma davranışı var (ör. Kaynaklar sayfasındaki kategori çubuğu).
    if (navigationType !== 'PUSH') return
    // #bolum içeren adreslerde hedefe kaydırmayı ilgili sayfa kendisi yapar
    // (ör. /hizmetlerimiz#sosyal-medya-yonetimi).
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, search, hash, navigationType])

  return null
}
