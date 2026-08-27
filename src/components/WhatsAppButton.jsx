import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/905558773534?text=Merhaba%2C%20influencer%20marketing%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 group"
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />
      <div className="absolute right-full mr-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          WhatsApp ile iletişime geç
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
        </div>
      </div>
    </a>
  )
}
