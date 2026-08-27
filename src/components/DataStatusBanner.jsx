import { AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'

// API'ye ulaşılamadığında site sessizce boş açılmasın diye görünür bir uyarı.
// En sık sebebi: API servisi kapalı ya da CORS_ORIGIN yanlış.
export default function DataStatusBanner() {
  const { error } = useData()
  if (!error) return null

  return (
    <div className="bg-red-50 border-b border-red-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-start gap-2 text-sm text-red-700">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          İçerikler yüklenemedi ({error}). Sunucuya şu anda ulaşılamıyor olabilir — lütfen
          sayfayı yenileyin veya birazdan tekrar deneyin.
        </p>
      </div>
    </div>
  )
}
