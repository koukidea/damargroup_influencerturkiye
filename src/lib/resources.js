import {
  Users, Share2, Megaphone, BarChart3, Newspaper, Lightbulb, TrendingUp,
  Camera, PenTool, Monitor, ShoppingCart, Film, Calendar, GraduationCap,
  Target, Sparkles, BookOpen, Rocket, Heart, Globe,
} from 'lucide-react'

// Kategori ikonu veritabanında serbest metin olarak saklanıyor. Eşleşme
// bulunamazsa sayfa çökmesin diye her zaman bir yedek ikon dönüyoruz.
export const CATEGORY_ICONS = {
  Users, Share2, Megaphone, BarChart3, Newspaper, Lightbulb, TrendingUp,
  Camera, PenTool, Monitor, ShoppingCart, Film, Calendar, GraduationCap,
  Target, Sparkles, BookOpen, Rocket, Heart, Globe,
}

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS)

const FALLBACK_CATEGORY = {
  slug: '',
  label: 'Genel',
  icon: 'Newspaper',
  color: 'rgb(220, 38, 38)',
  bg: 'rgba(220, 38, 38, 0.125)',
}

// Kategori silinmiş ya da liste henüz yüklenmemiş olabilir; çağıran tarafın
// her seferinde `?.` yazmak zorunda kalmaması için burada normalize ediyoruz.
export function resolveCategory(categories, slug) {
  const found = (categories || []).find((c) => c.slug === slug)
  const category = found || { ...FALLBACK_CATEGORY, slug: slug || '' }
  return {
    ...category,
    color: category.color || FALLBACK_CATEGORY.color,
    bg: category.bg || FALLBACK_CATEGORY.bg,
    label: category.label || FALLBACK_CATEGORY.label,
    Icon: CATEGORY_ICONS[category.icon] || Newspaper,
  }
}

// Yazılar kök adreste yayınlanıyor: /yazi-basligi
// Adres yapısı değişirse tek yer burasıdır.
export function resourcePath(slug) {
  return `/${slug}`
}

export const RESOURCES_INDEX_PATH = '/kaynaklar'

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
