import { useId, useRef, useState } from 'react'
import { UploadCloud, Link2, X, Loader2 } from 'lucide-react'
import { api } from '../../lib/api.js'

// Panel formlarındaki görsel alanı. Dosya seçilince (ya da sürüklenince)
// sunucuya yüklenir, dönen adres form değerine yazılır. Elle yol/URL yazma
// seçeneği de kalıyor: sunucuda zaten duran /portf/... görselleri ve dış
// adresler için.
export default function ImageUploadField({
  value,
  onChange,
  label = 'Görsel',
  hint,
  aspect = 'aspect-[3/4]',
  required = false,
}) {
  const inputId = useId()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [manual, setManual] = useState(false)

  async function handleFile(file) {
    if (!file) return
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      const result = await api.upload('/uploads', file, { onProgress: setProgress })
      onChange(result.url)
      setManual(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>

      {/* Dar ekranda önizleme üstte, geniş ekranda solda. */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div
          className={`w-20 sm:w-24 shrink-0 ${aspect} rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center`}
        >
          {value ? (
            <img
              src={value}
              alt="önizleme"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = 0.2)}
            />
          ) : (
            <span className="text-[11px] text-gray-400 text-center px-2">Görsel yok</span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
            } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                <span className="text-sm text-gray-700">Yükleniyor… %{progress}</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold text-red-600">Dosya seç</span> ya da buraya sürükle
                </span>
                <span className="text-xs text-gray-500">
                  JPG, PNG, WebP, HEIC · en fazla 20 MB · otomatik WebP'ye çevrilir
                </span>
              </>
            )}
            <input
              id={inputId}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          {manual ? (
            <div className="flex gap-2">
              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input"
                placeholder="/portf/kullaniciadi.webp veya https://..."
                autoFocus
              />
              <button
                type="button"
                onClick={() => setManual(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Yol girişini kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
              <button
                type="button"
                onClick={() => setManual(true)}
                className="inline-flex items-center gap-1 whitespace-nowrap text-gray-500 hover:text-red-600"
              >
                <Link2 className="w-3.5 h-3.5" />
                Yol / adres gir
              </button>
              {value && (
                <span className="min-w-0 max-w-full truncate text-gray-400" title={value}>
                  {value}
                </span>
              )}
            </div>
          )}

          {hint && !error && <span className="block text-xs text-gray-500">{hint}</span>}
          {error && <span className="block text-xs text-red-600">{error}</span>}
        </div>
      </div>

      {/* Tarayıcı doğrulaması: görsel zorunluysa boş gönderilmesin. */}
      {required && <input tabIndex={-1} className="sr-only" value={value} onChange={() => {}} required />}
    </div>
  )
}
