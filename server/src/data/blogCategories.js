// Kaynaklar bölümünün kategori yapısı.
// Her kategori ayrı bir SEO amacına hizmet ediyor; sıralama menüde ve
// filtre çubuğunda göründüğü sıradır.

const blogCategories = [
  {
    slug: 'rehberler',
    label: 'Rehberler',
    icon: 'BookOpen',
    color: 'rgb(220, 38, 38)',
    bg: 'rgba(220, 38, 38, 0.125)',
    description: 'Baştan sona anlatan, kalıcı başvuru içerikleri — SEO omurgası.',
  },
  {
    slug: 'icgoruler',
    label: 'İçgörüler',
    icon: 'Lightbulb',
    color: 'rgb(239, 68, 68)',
    bg: 'rgba(239, 68, 68, 0.125)',
    description: 'Sektörel analiz ve ajans ekibimizin uzman görüşleri.',
  },
  {
    slug: 'arastirmalar-raporlar',
    label: 'Araştırmalar & Raporlar',
    icon: 'BarChart3',
    color: 'rgb(185, 28, 28)',
    bg: 'rgba(185, 28, 28, 0.125)',
    description: 'Veri odaklı içerikler; kendi ölçümlerimiz ve saha araştırmaları.',
  },
  {
    slug: 'basari-hikayeleri',
    label: 'Başarı Hikayeleri',
    icon: 'Sparkles',
    color: 'rgb(220, 38, 38)',
    bg: 'rgba(220, 38, 38, 0.125)',
    description: 'Gerçek kampanya sonuçları ve vaka analizleri.',
  },
  {
    slug: 'trendler',
    label: 'Trendler',
    icon: 'TrendingUp',
    color: 'rgb(239, 68, 68)',
    bg: 'rgba(239, 68, 68, 0.125)',
    description: 'Güncel, hızlı tüketilen ve sık güncellenen içerikler.',
  },
  {
    slug: 'influencer-marketing-sozlugu',
    label: 'Influencer Marketing Sözlüğü',
    icon: 'GraduationCap',
    color: 'rgb(185, 28, 28)',
    bg: 'rgba(185, 28, 28, 0.125)',
    description: 'Terim terim açıklamalar — uzun kuyruk arama trafiğinin kaynağı.',
  },
]

// Eski kategori yapısındaki yazılar yeni kategorilere bu eşleşmeyle taşınıyor.
// Böylece mevcut 7 yazı kategorisiz kalmıyor ve adresleri değişmiyor.
const legacyCategoryMap = {
  'influencer-marketing': 'rehberler',
  'sosyal-medya-yonetimi': 'rehberler',
  'dijital-reklam-performans': 'rehberler',
  'vaka-analizleri': 'basari-hikayeleri',
  'sektor-haberleri': 'icgoruler',
}

// Kategori eşlemesi kaba bir dağıtım yapıyor; birkaç yazı konusu gereği
// başka kategoriye ait. Bunlar slug bazında burada düzeltiliyor.
const postCategoryOverrides = {
  '2026-sosyal-medya-algoritmalari-rehberi': 'trendler',
}

module.exports = { blogCategories, legacyCategoryMap, postCategoryOverrides }
