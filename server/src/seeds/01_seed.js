const bcrypt = require('bcryptjs')
const {
  blogCategories,
  legacyCategoryMap,
  postCategoryOverrides,
} = require('../data/blogCategories.js')
const { blogPosts } = require('../data/blogPosts.js')
const { portfolioCreators } = require('../data/portfolioCreators.js')
const { normalizeHandle } = require('../lib/handle.js')

const influencers = [
  { name: 'Zeynep Boz', image: '/assets/webp/zey_zor-Bj1gTP3O.webp', followers: '813K', engagement: '%2', instagram: 'https://www.instagram.com/zey_zor' },
  { name: 'Burak Çelebi', image: '/assets/webp/clburakkk-Bl2QpiMH.webp', followers: '321K', engagement: '%8', instagram: 'https://www.instagram.com/clburakkk' },
  { name: 'Samet Jankovic', image: '/assets/webp/jankovicsamet-CDjRUAIW.webp', followers: '261K', engagement: '%3', instagram: 'https://www.instagram.com/jankovicsamet' },
  { name: 'Sara Yılmaz', image: '/assets/webp/boncuksara-Cy0FGJqA.webp', followers: '896K', engagement: '%8', instagram: 'https://www.instagram.com/boncuksara' },
  { name: 'İlayda Simay Gül', image: '/assets/webp/dr_ilaydasimaygul-DKELsZqD.webp', followers: '172K', engagement: '%4', instagram: 'https://www.instagram.com/dr.ilaydasimaygul' },
  { name: 'Sena Şura Er', image: '/assets/webp/senasuraeerr-I6DyNyc8.webp', followers: '354K', engagement: '%3', instagram: 'https://www.instagram.com/senasuraeerr' },
]

const services = [
  { slug: 'strateji-ve-marka-yonetimi', title: 'Strateji ve Marka Yönetimi', icon: 'Target', description: 'Markanızın hedeflerine uygun, sürdürülebilir büyüme sağlayacak güçlü bir yol haritası oluşturuyoruz.', items: ['Marka Stratejisi Oluşturma', 'Rakip Analizi', 'Hedef Kitle Analizi', 'Marka Konumlandırma', 'İletişim Stratejisi', 'Pazarlama Planı Hazırlama', 'Lansman Planlaması'] },
  { slug: 'sosyal-medya-yonetimi', title: 'Sosyal Medya Yönetimi', icon: 'Share2', description: 'Markanızın tüm sosyal medya kanallarını stratejik olarak yönetip topluluğunuzu büyütüyoruz.', items: ['Instagram yönetimi', 'TikTok yönetimi', 'LinkedIn yönetimi', 'Facebook yönetimi', 'X (Twitter) yönetimi', 'YouTube yönetimi', 'İçerik takvimi hazırlama', 'Topluluk yönetimi', 'Yorum ve mesaj yönetimi'] },
  { slug: 'influencer-marketing', title: 'Influencer Marketing', icon: 'Users', description: "Markanıza en uygun influencer'ları seçip kampanyanızı baştan sona yönetiyoruz.", items: ['Influencer seçimi', 'Mikro ve makro influencer planlaması', 'Kampanya yönetimi', 'Influencer sözleşmeleri', 'Performans raporları', 'Satış odaklı influencer çalışmaları'] },
  { slug: 'dijital-reklam-yonetimi', title: 'Dijital Reklam Yönetimi', icon: 'Megaphone', description: 'Tüm dijital reklam platformlarında bütçenizi en verimli şekilde kullanıyoruz.', items: ['Meta (Instagram/Facebook) reklamları', 'Google Ads', 'YouTube reklamları', 'TikTok Ads', 'LinkedIn Ads', 'Yeniden pazarlama (Remarketing)', 'Dönüşüm optimizasyonu', 'Reklam bütçesi yönetimi'] },
  { slug: 'performans-pazarlamasi', title: 'Performans Pazarlaması', icon: 'TrendingUp', description: 'Satış ve dönüşüm odaklı, ölçülebilir kampanyalarla yatırım getirinizi artırıyoruz.', items: ['Satış odaklı kampanyalar', 'Lead (müşteri adayı) toplama', 'ROAS optimizasyonu', 'Dönüşüm artırma çalışmaları', 'Funnel oluşturma', 'A/B testleri'] },
  { slug: 'icerik-uretimi', title: 'İçerik Üretimi', icon: 'Camera', description: 'Markanız için profesyonel foto, video ve animasyon içerikleri üretiyoruz.', items: ['Fotoğraf çekimi', 'Ürün çekimi', 'Video prodüksiyonu', 'Reklam filmi', 'Reels üretimi', 'TikTok içerikleri', 'YouTube videoları', 'Drone çekimleri', 'Motion Graphic', '2D/3D Animasyon'] },
  { slug: 'grafik-tasarim', title: 'Grafik Tasarım', icon: 'PenTool', description: 'Markanızın görsel kimliğini oluşturan tüm tasarım ihtiyaçlarını karşılıyoruz.', items: ['Logo tasarımı', 'Kurumsal kimlik', 'Kartvizit', 'Broşür', 'Katalog', 'Banner', 'Sosyal medya tasarımları', 'Ambalaj tasarımı', 'Outdoor reklam tasarımları'] },
  { slug: 'web-hizmetleri', title: 'Web Hizmetleri', icon: 'Monitor', description: 'Hızlı, modern ve dönüşüm odaklı web siteleri tasarlıyor ve geliştiriyoruz.', items: ['Kurumsal web sitesi', 'E-ticaret sitesi', 'Landing Page', 'UI/UX Tasarımı', 'Web geliştirme', 'Hosting ve bakım', 'Hız optimizasyonu'] },
  { slug: 'e-ticaret-danismanligi', title: 'E-Ticaret Danışmanlığı', icon: 'ShoppingCart', description: 'Pazaryerlerinde ve kendi mağazanızda satışlarınızı artıracak stratejiler kuruyoruz.', items: ['Trendyol mağaza yönetimi', 'Hepsiburada yönetimi', 'Amazon yönetimi', 'Shopify kurulumu', 'Ürün listeleme', 'Reklam optimizasyonu', 'Satış artırma stratejileri'] },
  { slug: 'produksiyon', title: 'Prodüksiyon', icon: 'Film', description: 'TV ve dijital için profesyonel stüdyo ve saha prodüksiyon hizmetleri sunuyoruz.', items: ['TV reklamları', 'Kurumsal tanıtım filmi', 'Ürün tanıtım videoları', 'Podcast çekimi', 'Greenbox stüdyo çekimleri', 'Canlı yayın prodüksiyonu'] },
  { slug: 'etkinlik-ve-organizasyon', title: 'Etkinlik ve Organizasyon', icon: 'Calendar', description: 'Markanızı hedef kitlenizle buluşturan etkinlikleri baştan sona organize ediyoruz.', items: ['Lansman organizasyonları', 'Basın toplantıları', 'Influencer etkinlikleri', 'Marka deneyim etkinlikleri', 'Fuar organizasyonları'] },
  { slug: 'danismanlik', title: 'Danışmanlık', icon: 'Lightbulb', description: 'Markanızın büyüme yolculuğunda stratejik danışmanlık desteği sağlıyoruz.', items: ['Dijital dönüşüm danışmanlığı', 'Pazarlama danışmanlığı', 'Büyüme stratejileri', 'Franchise pazarlama', 'Global pazara açılma danışmanlığı'] },
  { slug: 'egitim', title: 'Eğitim', icon: 'GraduationCap', description: 'Ekiplerinizi dijital pazarlamanın güncel araç ve yöntemleriyle donatıyoruz.', items: ['Kurumsal sosyal medya eğitimi', 'Reklam eğitimi', 'Yapay zekâ araçları eğitimi', 'Influencer eğitimi', 'Satış ve pazarlama eğitimleri'] },
]


const resources = [
  {
    slug: 'dogru-influencer-secmenin-6-kriteri',
    title: "Markanız İçin Doğru Influencer'ı Seçmenin 6 Kriteri",
    category_slug: 'influencer-marketing',
    excerpt: "Takipçi sayısı artık en önemli kriter değil. Bir influencer'la çalışmadan önce gerçekten bakmanız gereken 6 metrik.",
    date: '2026-07-14',
    read_time: '6 dk',
    content: `Influencer marketing bütçesi olan her marka aynı hatayı yapma riski taşır: takipçi sayısına bakıp karar vermek. Oysa 500 bin takipçisi olan ama %1'in altında etkileşimi olan bir hesap, 30 bin takipçili ama %8 etkileşimi olan bir mikro influencer'dan çok daha az değer üretebilir.

## 1. Etkileşim Oranı, Takipçi Sayısından Önce Gelir

Etkileşim oranı bir hesabın gerçek takipçi kalitesini gösterir. Sektör ortalamasının altında bir etkileşim oranı, satın alınmış takipçi veya pasif bir kitle işareti olabilir.

## 2. Kitle Uyumu

Influencer'ın takipçi kitlesinin demografik yapısı markanızın hedef kitlesiyle örtüşmeli.

- Etkileşim oranını kontrol edin
- Kitle demografisini doğrulayın
- Geçmiş marka işbirliklerini inceleyin
- Profesyonellik ve iletişimi değerlendirin`,
  },
  {
    slug: '2026-influencer-marketing-trendleri',
    title: "2026'da Influencer Marketing Trendleri: Markaların Bilmesi Gerekenler",
    category_slug: 'sektor-haberleri',
    excerpt: 'Kısa video formatının yükselişinden yapay zekâ destekli içerik üretimine, bu yıl öne çıkan trendler.',
    date: '2026-08-05',
    read_time: '6 dk',
    content: `Influencer marketing sektörü her yıl hızla evriliyor.

## Uzun Vadeli İş Ortaklıkları

Tek seferlik sponsorlu paylaşımlar yerine markalar, aynı influencer'la 3-6 aylık süreçlere yayılan işbirlikleri kuruyor.

- Performans bazlı anlaşmalar yaygınlaşıyor
- Mikro ve nano influencer bütçeleri büyüyor
- Kısa video formatı hâlâ zirvede
- Şeffaf performans raporlama standart hâline geliyor`,
  },
  {
    slug: 'mikro-mu-makro-influencer-mi',
    title: 'Mikro mu Makro Influencer mı? Bütçenize Göre Doğru Strateji',
    category_slug: 'influencer-marketing',
    excerpt:
      "Aynı bütçeyle 1 makro influencer'a mı yatırım yapmalısınız, yoksa 10 mikro influencer'a mı dağıtmalısınız? Cevap kampanya hedefinize göre değişiyor.",
    date: '2026-06-02',
    read_time: '5 dk',
    content: `Influencer marketing dünyasında tek doğru strateji yoktur. Makro influencer'lar (100K+ takipçi) geniş erişim ve marka bilinirliği sağlarken, mikro influencer'lar (10K-100K) daha yüksek etkileşim ve daha güvenilir tavsiye hissi sunar.

## Makro Influencer Ne Zaman Doğru Seçim?

- Yeni bir ürün lansmanında hızlı ve geniş bilinirlik hedefliyorsanız
- Marka imajınız için "sosyal kanıt" (celebrity endorsement) etkisi arıyorsanız
- Tek seferlik, yüksek görünürlüklü bir kampanya planlıyorsanız

## Mikro Influencer Ne Zaman Doğru Seçim?

- Satış ve dönüşüm odaklı, performans bazlı bir kampanya kurguluyorsanız
- Niş bir hedef kitleye ulaşmak istiyorsanız
- Bütçenizi birden fazla ses ile test ederek riski dağıtmak istiyorsanız

## Hibrit Yaklaşım

Çoğu başarılı kampanya aslında bir hibrit modelde çalışır: bilinirlik için 1-2 makro influencer, dönüşüm ve güven için 8-10 mikro influencer'dan oluşan bir portföy.`,
  },
  {
    slug: '2026-sosyal-medya-algoritmalari-rehberi',
    title: "2026'da Sosyal Medya Algoritmalarını Anlamak: Markalar İçin Pratik Rehber",
    category_slug: 'sosyal-medya-yonetimi',
    excerpt:
      'Instagram, TikTok ve YouTube algoritmaları içeriği nasıl sıralıyor? Organik erişiminizi artıracak pratik ipuçları.',
    date: '2026-05-20',
    read_time: '7 dk',
    content: `Sosyal medya algoritmaları sürekli değişse de, tüm platformların ortak bir önceliği var: kullanıcıyı platformda daha uzun süre tutan içeriği ödüllendirmek.

## Instagram: Etkileşim Hızı Kritik

Instagram, bir gönderinin yayınlandıktan sonraki ilk 30-60 dakikada aldığı etkileşimi ağırlıklı olarak değerlendirir.

## TikTok: İzleyici Yeniden İzlemesi

TikTok'un For You algoritması, videonun sonuna kadar izlenip izlenmediğini ve tekrar izlenip izlenmediğini diğer tüm metriklerden daha çok önemser.

## YouTube: Oturum Süresi

YouTube, videonuzun izleyiciyi platformda ne kadar süre tuttuğunu önceliklendirir.

## Markalar İçin 3 Pratik Adım

- Paylaşım saatlerini kitlenizin en aktif olduğu saatlere göre test edin
- İlk yorumları siz ve ekibiniz atarak etkileşimi tetikleyin
- Tek platforma özel formatlar üretin`,
  },
  {
    slug: 'etkili-icerik-takvimi-nasil-hazirlanir',
    title: 'Etkili Bir İçerik Takvimi Nasıl Hazırlanır?',
    category_slug: 'sosyal-medya-yonetimi',
    excerpt:
      'Ajanslarda kullanılan içerik takvimi şablonu ve markanızın sosyal medyasını düzenli, tutarlı yönetmenin adımları.',
    date: '2026-04-11',
    read_time: '5 dk',
    content: `Düzensiz paylaşım, sosyal medya büyümesini yavaşlatan en yaygın nedenlerden biridir.

## 1. İçerik Sütunlarını Belirleyin

Her marka için 3-5 tekrarlayan içerik teması belirleyin: ürün tanıtımı, kullanıcı yorumları, kurum kültürü, eğitici içerik.

## 2. Platform Bazlı Oranları Ayarlayın

Her platformun farklı bir içerik dengesi olmalı.

## 3. Üretim ile Yayını Ayırın

İçerik üretimini aylık bloklar halinde yapıp yayın takvimini haftalık gözden geçirin.

## 4. Performansı Haftalık Değerlendirin

Takvimi statik bir doküman olarak değil, haftalık performans verisine göre güncellenen canlı bir plan olarak yönetin.`,
  },
  {
    slug: 'meta-google-ads-roas-artirma',
    title: "Meta ve Google Ads'te ROAS'ı Artırmanın 7 Yolu",
    category_slug: 'dijital-reklam-performans',
    excerpt:
      'Reklam bütçenizden daha fazla verim almak için kampanya yapısından kreatif testine kadar 7 somut aksiyon.',
    date: '2026-03-18',
    read_time: '8 dk',
    content: `ROAS, harcanan her 1 TL'nin ne kadar gelire dönüştüğünü gösterir.

- Kampanya yapısını sadeleştirin
- Kreatif çeşitliliğini artırın
- Dönüşüm penceresini doğru ayarlayın
- Yeniden pazarlama listelerinizi segmentlere ayırın
- Landing page hızını optimize edin
- A/B testlerini tek değişkenle yapın
- Negatif hedef kitleleri tanımlayın`,
  },
  {
    slug: 'donusum-odakli-funnel-kurgusu',
    title: 'Dönüşüm Odaklı Kampanya Kurgusu: Funnel Mantığı Nedir?',
    category_slug: 'dijital-reklam-performans',
    excerpt:
      'Farkındalıktan satışa uzanan yolculukta reklam bütçenizi doğru aşamalara dağıtmanın mantığı.',
    date: '2026-02-09',
    read_time: '6 dk',
    content: `Birçok marka, tek bir reklam setiyle doğrudan satış beklerken hayal kırıklığına uğrar. Müşteri yolculuğu genellikle üç aşamadan geçer.

## Üst Huni: Farkındalık

Geniş kitlelere markanızı tanıtan, düşük maliyetli erişim odaklı içerikler.

## Orta Huni: Değerlendirme

Sizinle etkileşime giren kitleye ürün faydalarını gösteren içerikler.

## Alt Huni: Dönüşüm

Sepeti terk edenler için indirim veya güven vurgusu içeren yeniden pazarlama reklamları.`,
  },
]

// Yeni alanlar (yazar / etiket / durum) seed verisine buradan ekleniyor —
// böylece yukarıdaki uzun makale nesneleri sade kalıyor.
const resourceMeta = {
  'dogru-influencer-secmenin-6-kriteri': { tags: 'influencer seçimi, etkileşim oranı, kitle analizi' },
  '2026-influencer-marketing-trendleri': { tags: 'trendler, 2026, sektör' },
  'mikro-mu-makro-influencer-mi': { tags: 'mikro influencer, makro influencer, bütçe' },
  '2026-sosyal-medya-algoritmalari-rehberi': { tags: 'algoritma, instagram, tiktok' },
  'etkili-icerik-takvimi-nasil-hazirlanir': { tags: 'içerik takvimi, planlama' },
  'meta-google-ads-roas-artirma': { tags: 'roas, meta ads, google ads' },
  'donusum-odakli-funnel-kurgusu': { tags: 'funnel, dönüşüm, performans' },
}

exports.seed = async function (knex) {
  await knex('applications').del()
  await knex('resources').del()
  await knex('resource_categories').del()
  await knex('service_items').del()
  await knex('services').del()
  await knex('influencers').del()
  await knex('users').del()

  const passwordHash = await bcrypt.hash('admin123', 10)
  await knex('users').insert({
    name: 'Yönetici',
    email: 'admin@influencerturkiye.com',
    password_hash: passwordHash,
    role: 'admin',
    avatar: '💼',
  })

  // Anasayfa kartları ile portföy galerisi aynı tabloda; kayıt hangi sayfada
  // görüneceğini show_on_home / show_in_portfolio ile taşır. Kullanıcı adı
  // her iki listede de geçenler tek satır olarak yazılır.
  const rows = influencers.map((inf) => ({
    ...inf,
    handle: normalizeHandle(inf.instagram),
    show_on_home: true,
    show_in_portfolio: false,
  }))
  for (const creator of portfolioCreators) {
    const handle = normalizeHandle(creator.handle)
    const existing = rows.find((r) => r.handle.toLowerCase() === handle.toLowerCase())
    if (existing) {
      existing.show_in_portfolio = true
      continue
    }
    rows.push({
      name: handle,
      handle,
      image: creator.image,
      followers: '',
      engagement: '',
      instagram: creator.instagram,
      show_on_home: false,
      show_in_portfolio: true,
    })
  }
  await knex('influencers').insert(rows.map((row, i) => ({ ...row, position: i })))

  await knex('resource_categories').insert(
    blogCategories.map((c, i) => ({ ...c, position: i }))
  )

  for (const [sIndex, service] of services.entries()) {
    const [id] = await knex('services').insert(
      {
        slug: service.slug,
        title: service.title,
        description: service.description,
        icon: service.icon,
        position: sIndex,
      },
      ['id']
    )
    const serviceId = typeof id === 'object' ? id.id : id
    await knex('service_items').insert(
      service.items.map((text, i) => ({ service_id: serviceId, text, position: i }))
    )
  }

  // Mevcut yazılar yeni kategori yapısına taşınıyor; slug'ları değişmiyor,
  // dolayısıyla yayınlanmış adresleri de korunuyor.
  const legacyPosts = resources.map((resource) => ({
    ...resource,
    category_slug:
      postCategoryOverrides[resource.slug] ||
      legacyCategoryMap[resource.category_slug] ||
      'rehberler',
    author: 'Influencer Türkiye',
    status: 'published',
    tags: resourceMeta[resource.slug]?.tags || null,
    cover_image: resourceMeta[resource.slug]?.cover_image || null,
  }))

  const newPosts = blogPosts.map((post) => ({
    ...post,
    status: post.status || 'published',
  }))

  await knex('resources').insert([...legacyPosts, ...newPosts])
}
