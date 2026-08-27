import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useSeo } from '../lib/seo.js'

// DİKKAT: Bu sayfadaki metin, müşterinin talebi üzerine eski siteden birebir
// alınmıştır (eski derleme: assets/js/KVKKPage-*.js). Başlıklar, paragraflar ve
// sıralama olduğu gibi korunmalı; metinde değişiklik yapılacaksa önce müşteri
// onayı alınmalı. Adres, MERSİS ve vergi numarası gibi künye bilgileri
// müşterinin talimatıyla bilerek yer almıyor.
//
// Eski metinden bilerek ayrılan tek yer iletişim bilgileri: telefon numarası ve
// iletişim sayfasının adresi, sitenin geri kalanıyla uyumlu olsun diye güncel
// değerlerle değiştirildi (eskisi: 0 542 212 53 95 ve .../iletisim.html).

export default function KVKKPage() {
  useSeo({
    title: 'KVKK Aydınlatma Metni',
    description:
      'Kişisel verilerin korunması kanunu kapsamında aydınlatma metni ve veri işleme politikamız.',
    canonical: '/kvkk',
  })

  return (
    <section className="bg-white py-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Kişisel Verilerin Korunması
              </h1>
              <p className="text-gray-600 mt-2">Influencer Türkiye İnc.</p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-10 space-y-8 text-gray-700 leading-relaxed">
            <div>
              <p className="mb-4">
                Influencer Türkiye İnc. ("Influencer Türkiye") olarak kişisel verilerinizin
                güvenliği hususuna azami hassasiyet göstermekteyiz. Influencer Türkiye olarak
                hizmetlerimizden faydalanan kişiler dahil, Influencer Türkiye ile ilişkili tüm
                şahıslara ait her türlü kişisel verilerin 6698 sayılı Kişisel Verilerin
                Korunması Kanunu'na ("KVKK") uygun olarak işlenerek, muhafaza edilmesine önem
                vermekteyiz. Bu sorumluluğumuzun tam bilinci ile KVKK uyarınca "Veri Sorumlusu"
                sıfatıyla, kişisel verilerinizi aşağıda yer alan kapsamda ve şartlarda
                işlemekteyiz.
              </p>
              <p>
                Influencer Türkiye tarafından kişisel verilerinizin ne tür yöntemler aracılığıyla
                ve hangi amaçlar doğrultusunda işlendiği ve saklandığı hakkında daha detaylı
                bilgi için Influencer Türkiye Gizlilik İlkeleri ve Çerezler Hakkında Bildirim'i
                inceleyebilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Kişisel Veri Nedir?</h2>
              <p>
                Kişisel veri, KVKK'da kimliği belirli veya belirlenebilir gerçek kişiye ilişkin
                her türlü bilgi olarak tanımlanmıştır. Buna göre bizimle paylaştığınız adınız,
                soyadınız, doğum tarihiniz, elektronik posta adresiniz, telefon numaranız ve
                benzeri bilgiler kişisel veri olarak adlandırılmaktadır.
              </p>
              <p className="mt-4">
                Influencer Türkiye, kişisel verilerinizi, Influencer Türkiye ile doğrudan
                paylaştığınız hallerde, otomatik yollarla veya üçüncü şahıs platformları gibi
                başka kaynaklar aracılığıyla toplamaktadır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Kişisel verilerinizin işlenme amacı ve dayanağı nedir?
              </h2>
              <p className="mb-4">
                Influencer Türkiye ile olan hizmet ilişkiniz dolayısıyla yasal yükümlülüklerimizi
                yerine getirebilmek ve sizi avantajlardan haberdar edebilmek için Influencer
                Türkiye kişisel bilgilerinizi toplamaktadır ve bu kapsamda işlemektedir.
              </p>
              <p className="mb-4">
                Bu doğrultuda Influencer Türkiye; kişisel verilerinizi, her türlü şikâyetinizi
                değerlendirmek ve işleme almak, hizmetlerimizi, iletişim yöntemlerimizi ve
                internet sitemizin işlevselliğini geliştirmek ve sizin iletişim içerikleri ve
                hedefe yönelik reklamlar ve ayrıca hizmet tavsiyeleri sunmak için toplamakta ve
                işlemektedir.
              </p>
              <p>
                Yukarıda sayılan amaçlar doğrultusunda Influencer Türkiye, kişisel verilerinizi,
                açık rızanıza istinaden, veya sizinle yaptığımız sözleşmenin kurulması veya
                ifasıyla doğrudan doğruya ilgili olması halinde veya temel hak ve
                özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimizin gerektirdiği
                hallerde, burada belirtilen amaçlar ve kapsam dahilinde işlemekte ve
                saklamaktadır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Kişisel verilerinizi hangi amaçla, kimlere aktarıyoruz?
              </h2>
              <p>
                Kişisel verileriniz Influencer Türkiye hissedarlarıyla, doğrudan/dolaylı
                yurtiçi/yurtdışı iştiraklerimizle, iş ilişkisinin devamı esnasında birlikte bizi
                temsil eden ve/veya faaliyetlerimizi yürütebilmek için işbirliği yaptığımız iş
                ortağımız olan yurtiçi/yurtdışı kişi ve kurumlarla (kargo, gönderi, çağrı
                merkezi, veri tabanı, bulut vb. hizmetleri sunan şirketlerle)
                paylaşılabilmektedir. Ayrıca, yasal yükümlülüklerimiz nedeniyle ve bunlarla
                sınırlı olmak üzere mahkemeler ve diğer kamu kurumları ile kişisel veriler
                paylaşılmaktadır. Ayrıca, Influencer Türkiye internet sitesini ziyaretinize
                ilişkin kişisel verilerinizi ve gezinme bilgileriniz gibi trafik bilgilerinizi;
                güvenliğiniz ve Influencer Türkiye'nin ilgili mevzuat kapsamındaki
                yükümlülüklerinin ifası amacıyla yasal olarak bu bilgileri kanunen talep etmeye
                yetkili olan kamu kurum ve kuruluşları ile paylaşabilecektir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Kişisel verilerinizi nasıl saklıyoruz?
              </h2>
              <p>
                Şirketimiz ile paylaşılan kişisel verileriniz Influencer Türkiye'nin
                yurtiçi/yurtdışı güvenli sunucularında ilgili yasal düzenlemelere, KVKK
                hükümlerine ve Influencer Türkiye standartlarına uygun olarak saklanmaktadır. Bu
                kapsamda Influencer Türkiye, kişisel verilerinizin güvenliğini sağlamak adına
                yasal mevzuat ile belirlenen gerekli teknik ve idari güvenlik önlemlerini
                almaktadır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Kişisel verilerinizi ne kadar süre ile tutuyoruz?
              </h2>
              <p>
                KVKK Madde 7/f.1. hükmü uyarınca, kişisel verilerinizin işlenmesi gerektiren amaç
                ortadan kalktığında ve/veya ilgili mevzuat uyarınca verilerinizi saklamakla
                yükümlü kılındığımız yasal süreler dolduğunda, kişisel verileriniz tarafımızca
                silinecek, yok edilecek veya anonim hale getirilecektir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Kişisel Verilerin Korunması Kanunu'ndan doğan haklarınız nelerdir?
              </h2>
              <p className="mb-4">
                KVKK Madde 11 uyarınca, kişisel verilerinizin işlendiği Influencer Türkiye
                tarafından veri sorumlusu sıfatı ile işlediği ölçüde;
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>herhangi bir kişisel verinizin işlenip işlenmediğini öğrenme;</li>
                <li>kişisel verilerinizin işlenme faaliyetlerine ilişkin olarak bilgi talep etme;</li>
                <li>kişisel verilerinizin işlenme amaçlarını öğrenme;</li>
                <li>
                  kişisel verilerin yurt içinde veya yurt dışında üçüncü kişilere aktarılmış
                  olması durumunda bu kişileri öğrenme;
                </li>
                <li>
                  kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların
                  düzeltilmesini isteme;
                </li>
                <li>
                  kişisel verilerin işlenmesini gerektiren sebeplerin ortadan kalkması halinde
                  kişisel verilerin silinmesini veya yok edilmesini isteme;
                </li>
                <li>
                  silme ve düzeltme işlemlerinin, verilerin aktarıldığını üçüncü kişilere
                  bildirilmesi isteme;
                </li>
                <li>
                  kişisel verilerin otomatik sistemler vasıtasıyla işlenmesi sonucu ortaya
                  çıkabilecek aleyhte sonuçlara itiraz etme; ve
                </li>
                <li>
                  kişisel verilerinizin kanuna aykırı bir şekilde işlenmesi sebebiyle zarara
                  uğramanız halinde bu zararın tazmin edilmesini isteme hakkına sahipsiniz.
                </li>
              </ul>
              <p className="mt-4">
                Başvurunuzda yer alan talepleriniz, talebin niteliğine göre en kısa sürede ve en
                geç otuz gün içinde sonuçlandırılacaktır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tarafımıza bildirmiş olduğunuz kişisel verilerinize ilişkin haklarınızı ne
                şekilde kullanabilirsiniz?
              </h2>
              <p>
                KVKK Madde 11'de yer alan ve yukarıda sayılan haklarınızı{' '}
                <Link
                  to="/iletisim"
                  className="text-red-600 hover:text-red-700 underline"
                >
                  https://www.influencerturkiye.com/iletisim
                </Link>{' '}
                adresindeki iletişim formu aracılığıyla veya Influencer Türkiye iletişim hattı{' '}
                <a
                  href="tel:+905558773534"
                  className="text-red-600 hover:text-red-700 underline"
                >
                  0 (555) 877 35 34
                </a>{' '}
                'i arayarak kullanabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim</h3>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Telefon:</strong>{' '}
              <a href="tel:+905558773534" className="text-red-600 hover:text-red-700">
                0 (555) 877 35 34
              </a>
            </p>
            <p>
              <strong>E-posta:</strong>{' '}
              <a
                href="mailto:hello@influencerturkiye.com"
                className="text-red-600 hover:text-red-700"
              >
                hello@influencerturkiye.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
