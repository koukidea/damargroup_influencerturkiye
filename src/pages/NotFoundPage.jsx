import { Link } from 'react-router-dom'
import { Home, Newspaper, ArrowRight } from 'lucide-react'
import { useSeo } from '../lib/seo.js'
import { RESOURCES_INDEX_PATH } from '../lib/resources.js'

export default function NotFoundPage({
  title = 'Sayfa bulunamadı',
  message = 'Aradığınız adres taşınmış, adı değişmiş ya da hiç var olmamış olabilir.',
}) {
  useSeo({
    title,
    description: message,
    // Var olmayan sayfa arama sonuçlarına girmemeli.
    robots: 'noindex, follow',
  })

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-xl mx-auto text-center">
        <span className="text-red-600 text-7xl md:text-8xl font-bold tracking-tight">404</span>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">{title}</h1>
        <p className="text-gray-600 mt-4 leading-relaxed">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            Anasayfaya dön
          </Link>
          <Link
            to={RESOURCES_INDEX_PATH}
            className="group inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 px-6 py-3 rounded-2xl font-semibold transition-all"
          >
            <Newspaper className="w-4 h-4" />
            Kaynaklar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
