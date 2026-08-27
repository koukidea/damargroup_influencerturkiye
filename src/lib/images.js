import imageVariants from '../data/imageVariants.json'

// Influencer kartlarının CSS kutusu 287px genişliğe kadar çıkıyor (max-w-7xl konteyner,
// px-6 padding, 4 slide, 28px boşluk). Aşağıdaki eşikler slider'ın breakpoint'leriyle
// birebir aynı hesabı yapıyor, böylece tarayıcı doğru varyantı seçebiliyor.
export const INFLUENCER_CARD_SIZES = [
  '(min-width: 1280px) 287px',
  '(min-width: 1024px) calc((100vw - 132px) / 4)',
  '(min-width: 768px) calc((100vw - 96px) / 3)',
  'calc((100vw - 68px) / 2)',
].join(', ')

// Varyantlar build zamanında üretiliyor (bkz. scripts/generate-image-variants.mjs).
// Manifestte olmayan görseller — admin panelinden elle girilen yollar veya harici
// URL'ler — srcset'siz, tek kaynakla gösterilir.
export function influencerSrcSet(src) {
  const widths = imageVariants[src]
  if (!widths) return undefined

  const base = src.slice('/assets/webp/'.length, -'.webp'.length)
  return widths.map((width) => `/assets/webp/responsive/${base}-${width}w.webp ${width}w`).join(', ')
}
