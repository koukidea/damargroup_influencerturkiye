// Portföy sayfasının vaka çalışmaları.
// Vaka kartları şimdilik bu dosyadan besleniyor; gerçek kampanya
// referansları geldiğinde buradaki liste API verisiyle değiştirilecek.
//
// İçerik üretici galerisi artık burada değil: veritabanından geliyor ve
// yönetim panelindeki "Influencer'lar" sayfasından düzenleniyor
// (server/src/routes/influencers.js, show_in_portfolio bayrağı).

// Vaka çalışmaları. Marka isimleri sözleşme gereği anonim tutuluyor.
export const caseStudies = [
  {
    id: 'vaka-1',
    category: 'Kozmetik',
    title: 'Yeni Ürün Lansmanı',
    brand: 'Kozmetik Markası',
    summary:
      'Mikro ve makro influencer karması ile lansman haftasında yoğun görünürlük hedeflenen örnek kampanya kurgusu.',
    scope: ['Influencer Marketing', 'İçerik Üretimi', 'Sosyal Medya Yönetimi'],
    metrics: [
      { label: 'Erişim', value: '4.2M' },
      { label: 'Etkileşim', value: '%6,4' },
      { label: 'İçerik', value: '38' },
    ],
    image: '/portfolio-cases/kozmetik-urun-lansmani.jpg',
  },
  {
    id: 'vaka-2',
    category: 'E-Ticaret',
    title: 'Sezon Sonu Satış Kampanyası',
    brand: 'E-Ticaret Platformu',
    summary:
      'Dönüşüm odaklı influencer seçimi ve performans reklamlarının birlikte kurgulandığı örnek satış kampanyası.',
    scope: ['Performans Pazarlaması', 'Dijital Reklam Yönetimi', 'Influencer Marketing'],
    metrics: [
      { label: 'Erişim', value: '2.8M' },
      { label: 'Tıklama', value: '112K' },
      { label: 'İçerik', value: '24' },
    ],
    image: '/portfolio-cases/e-ticaret-satis-kampanyasi.jpg',
  },
  {
    id: 'vaka-3',
    category: 'Gıda & İçecek',
    title: 'Marka Bilinirliği Kampanyası',
    brand: 'Gıda Markası',
    summary:
      'Lifestyle içerik üreticileriyle uzun soluklu iş birliği üzerine kurulu örnek bilinirlik kampanyası.',
    scope: ['Strateji ve Marka Yönetimi', 'İçerik Üretimi', 'Prodüksiyon'],
    metrics: [
      { label: 'Erişim', value: '5.6M' },
      { label: 'Etkileşim', value: '%4,9' },
      { label: 'İçerik', value: '52' },
    ],
    image: '/portfolio-cases/gida-icecek-marka-bilinirligi.jpg',
  },
  {
    id: 'vaka-4',
    category: 'Moda',
    title: 'Koleksiyon Tanıtımı',
    brand: 'Moda Markası',
    summary:
      'Sezon koleksiyonunun moda ve tasarım odaklı içerik üreticileriyle tanıtıldığı örnek kampanya kurgusu.',
    scope: ['Influencer Marketing', 'Prodüksiyon', 'Grafik Tasarım'],
    metrics: [
      { label: 'Erişim', value: '3.1M' },
      { label: 'Etkileşim', value: '%7,2' },
      { label: 'İçerik', value: '29' },
    ],
    image: '/portfolio-cases/moda-koleksiyon-tanitimi.jpg',
  },
  {
    id: 'vaka-5',
    category: 'Teknoloji',
    title: 'Uygulama İndirme Kampanyası',
    brand: 'Mobil Uygulama',
    summary:
      'İndirme başına maliyet hedefiyle kurgulanan, reklam ve influencer içeriğinin birlikte çalıştığı örnek kampanya.',
    scope: ['Performans Pazarlaması', 'Dijital Reklam Yönetimi', 'Web Hizmetleri'],
    metrics: [
      { label: 'Erişim', value: '1.9M' },
      { label: 'İndirme', value: '46K' },
      { label: 'İçerik', value: '18' },
    ],
    image: '/portfolio-cases/teknoloji-uygulama-kampanyasi.jpg',
  },
  {
    id: 'vaka-6',
    category: 'Etkinlik',
    title: 'Lansman Etkinliği',
    brand: 'Kurumsal Marka',
    summary:
      'Davetli içerik üreticileri ve canlı yayın kurgusuyla desteklenen örnek etkinlik organizasyonu.',
    scope: ['Etkinlik ve Organizasyon', 'Prodüksiyon', 'Sosyal Medya Yönetimi'],
    metrics: [
      { label: 'Erişim', value: '2.3M' },
      { label: 'Katılımcı', value: '120' },
      { label: 'İçerik', value: '41' },
    ],
    image: '/portfolio-cases/etkinlik-lansman.jpg',
  },
]

export const caseCategories = ['Tümü', ...new Set(caseStudies.map((c) => c.category))]
