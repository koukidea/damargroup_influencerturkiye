import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Panel formları için ortalanmış pencere. Sayfanın neresinde olunursa olunsun
// ekranın ortasında açılır; böylece listede aşağıdayken "Düzenle"ye basınca
// yukarı kaydırmak gerekmez. Esc ve karartılmış arka plana tıklama kapatır,
// açıkken sayfa kaymaz, odak ilk alana gider.
const SIZES = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  headerActions,
  size = 'md',
}) {
  const panelRef = useRef(null)
  // onClose çoğu sayfada her render'da yeniden oluşturulan sıradan bir fonksiyon.
  // Effect'i ona bağlasaydık her tuş vuruşunda yeniden çalışır ve odağı ilk
  // alana geri çekerdi; bu yüzden güncel değer ref üzerinden okunuyor.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Yükseklik değişse de görünüm kaymasın diye odak ilk boş olmayan alana.
    const first = panelRef.current?.querySelector(
      'input:not([type=hidden]):not([type=file]):not([tabindex="-1"]), select, textarea'
    )
    first?.focus({ preventScroll: true })

    function onKeyDown(e) {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        // Yalnızca arka plana tıklanınca kapat; pencere içindeki tıklamalar
        // (ve içeriden başlayıp dışarıda biten seçimler) kapatmasın.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${SIZES[size] || SIZES.md} max-h-full flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  )
}
