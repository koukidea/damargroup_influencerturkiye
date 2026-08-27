import { Link } from 'react-router-dom'
import { Users, Briefcase, ArrowRight } from 'lucide-react'
import { useSeo } from '../lib/seo.js'

export default function ApplicationPage() {
  useSeo({
    title: 'Başvuru',
    description:
      "Influencer olarak ağımıza katılmak ya da markanız için kampanya başlatmak üzere başvurun.",
    canonical: '/basvuru',
  })

  return (
    <section className="bg-white py-16 md:py-24 px-6 min-h-[70vh] flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Başvuru
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
            Hangi Kategoride Başvuru Yapmak İstiyorsunuz?
          </h1>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Link
            to="/basvuru/influencer"
            className="group bg-gray-50 border border-gray-200 rounded-3xl p-10 text-center hover:border-red-200 hover:bg-red-50 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Influencer Başvuru</h2>
            <p className="text-gray-600 text-sm mb-6">
              Portföyümüze katılın, marka işbirlikleriyle tanışın.
            </p>
            <span className="inline-flex items-center gap-2 text-red-600 font-medium">
              Başvuru Yap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/basvuru/marka"
            className="group bg-gray-50 border border-gray-200 rounded-3xl p-10 text-center hover:border-red-200 hover:bg-red-50 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Marka Başvuru</h2>
            <p className="text-gray-600 text-sm mb-6">
              Kampanyanız için doğru influencer'larla buluşun.
            </p>
            <span className="inline-flex items-center gap-2 text-red-600 font-medium">
              Başvuru Yap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
