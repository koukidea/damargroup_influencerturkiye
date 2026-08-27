import { ChevronLeft, ChevronRight } from 'lucide-react'

// Sayfa numaralarını kısaltır: 1 … 4 5 6 … 12
function pageWindow(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1])
  const visible = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const result = []
  let previous = 0
  for (const page of visible) {
    if (previous && page - previous > 1) result.push('…')
    result.push(page)
    previous = page
  }
  return result
}

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null

  const buttonBase =
    'min-w-10 h-10 px-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-center'

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Sayfalama">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Önceki sayfa"
        className={`${buttonBase} bg-white text-gray-700 border-gray-200 hover:border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageWindow(page, pageCount).map((entry, index) =>
        entry === '…' ? (
          <span key={`gap-${index}`} className="px-1 text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onChange(entry)}
            aria-current={entry === page ? 'page' : undefined}
            className={`${buttonBase} ${
              entry === page
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-red-200 hover:bg-red-50'
            }`}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Sonraki sayfa"
        className={`${buttonBase} bg-white text-gray-700 border-gray-200 hover:border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
