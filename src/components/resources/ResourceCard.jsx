import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import { resolveCategory, resourcePath, formatDate } from '../../lib/resources.js'

// Liste, ana sayfa ve "ilgili yazılar" bölümleri aynı kartı kullanıyor.
export default function ResourceCard({ item, categories, compact = false }) {
  const category = resolveCategory(categories, item.category)
  const { Icon } = category

  return (
    <Link
      to={resourcePath(item.slug)}
      className="group flex flex-col bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden hover:border-red-200 hover:shadow-xl transition-all"
    >
      <div
        className={`relative ${compact ? 'h-28' : 'h-44'} flex items-center justify-center overflow-hidden`}
        style={{ backgroundColor: category.bg }}
      >
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.coverAlt || item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Icon className="w-10 h-10" style={{ color: category.color }} />
        )}
        {item.status === 'draft' && (
          <span className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-900/80 text-white">
            Taslak
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <span
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: category.color }}
        >
          {category.label}
        </span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug group-hover:text-red-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{item.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {item.readTime}
          </span>
          <span className="flex items-center gap-1 text-red-600 font-medium group-hover:gap-2 transition-all">
            Oku <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// Kart iskeleti — veri gelene kadar sayfanın zıplamasını önler.
export function ResourceCardSkeleton({ compact = false }) {
  return (
    <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden animate-pulse">
      <div className={`${compact ? 'h-28' : 'h-44'} bg-gray-200`} />
      <div className="p-6 space-y-3">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-4/5 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/5 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

export { formatDate }
