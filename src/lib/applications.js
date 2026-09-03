import { Users, Briefcase, MessageSquare } from 'lucide-react'

// Başvuru türlerinin panelde ortak görünümü (Başvurular sayfası + Genel Bakış).
export const APPLICATION_TYPES = {
  influencer: {
    label: 'Influencer Başvuru',
    short: 'Influencer',
    Icon: Users,
    iconWrap: 'bg-red-50',
    iconColor: 'text-red-600',
    badge: 'bg-red-50 text-red-600',
  },
  brand: {
    label: 'Marka Başvuru',
    short: 'Marka',
    Icon: Briefcase,
    iconWrap: 'bg-gray-100',
    iconColor: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-700',
  },
  contact: {
    label: 'İletişim Mesajı',
    short: 'İletişim',
    Icon: MessageSquare,
    iconWrap: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-600',
  },
}

export function applicationMeta(type) {
  return APPLICATION_TYPES[type] || APPLICATION_TYPES.contact
}

// Kartta gösterilecek ad: influencer ve iletişimde kişi adı, markada şirket.
export function applicationTitle(app) {
  return app.type === 'brand' ? app.company || app.contactName : app.name
}

export function formatApplicationDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// "3 saat önce" gibi kısa göreli zaman; bir haftadan eskiler tam tarih.
export function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'az önce'
  if (minutes < 60) return `${minutes} dk önce`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} saat önce`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} gün önce`
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
}
