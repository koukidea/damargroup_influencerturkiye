import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'
import { ACCEPTED, REJECTED, setConsent, useConsent } from '../lib/consent.js'

// Ziyaretçi bir yanıt verene kadar analitik ölçüm çalışmıyor (src/lib/analytics.js).
// Bant yalnızca tercih kaydı yokken görünür; footer'daki "Çerez Tercihleri"
// bağlantısı kaydı silerek bandı yeniden getirir.
export default function CookieBanner() {
  const consent = useConsent()

  if (consent !== null) return null

  return (
    <div
      // Mobilde WhatsApp düğmesinin (bottom-6 right-6) üstünde duruyor,
      // masaüstünde sol alt köşede kalıyor.
      className="fixed z-50 bottom-24 sm:bottom-6 left-4 right-4 sm:right-auto sm:w-[26rem]"
      role="region"
      aria-label="Çerez tercihi"
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-900 font-semibold">Çerez tercihiniz</p>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              Sitenin çalışması için gereken çerezleri kullanıyoruz. Ziyaretçi
              istatistiklerini ölçmek için kullandığımız Google Analytics çerezleri ise
              yalnızca siz onay verirseniz çalışır.{' '}
              <Link
                to="/cerez-politikasi"
                className="text-red-600 hover:underline font-medium"
              >
                Çerez Politikası
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            type="button"
            onClick={() => setConsent(ACCEPTED)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            Kabul Et
          </button>
          <button
            type="button"
            onClick={() => setConsent(REJECTED)}
            className="flex-1 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            Reddet
          </button>
        </div>
      </div>
    </div>
  )
}
