import { Link } from 'react-router-dom'
import { ArrowLeft, Cookie } from 'lucide-react'
import { useSeo } from '../lib/seo.js'

// Sayfa düzeni KVKK sayfasıyla aynı: ikisi de hukuki metin, ziyaretçi arada
// gidip gelirken aynı görünümü görsün.
//
// Aşağıdaki listede yalnızca sitenin gerçekten kullandığı kayıtlar var:
// - it_token / it_cookie_consent → src/lib/api.js ve src/lib/consent.js
// - _ga, _ga_<ölçüm-kimliği>     → Google Analytics 4 (src/lib/analytics.js)
// Siteye yeni bir ölçüm veya reklam aracı eklenirse bu tablo da güncellenmeli.

const LAST_UPDATED = '27 Ağustos 2026'

const COOKIES = [
  {
    name: 'it_token',
    type: 'Zorunlu',
    purpose:
      'Üye girişi yaptığınızda oturumunuzun açık kalmasını sağlar. Tarayıcınızın yerel depolama alanında tutulur, sunucuya çerez olarak gönderilmez.',
    duration: 'Oturumu kapatana kadar',
  },
  {
    name: 'it_cookie_consent',
    type: 'Zorunlu',
    purpose:
      'Çerez bandında verdiğiniz yanıtı (kabul/ret) saklar; her ziyarette aynı sorunun tekrarlanmasını önler.',
    duration: 'Tercihinizi değiştirene kadar',
  },
  {
    name: '_ga',
    type: 'Analitik',
    purpose:
      'Google Analytics tarafından ziyaretçileri birbirinden ayırmak için kullanılır. Yalnızca onay verirseniz oluşturulur.',
    duration: '2 yıl',
  },
  {
    name: '_ga_KVP8LZJMRN',
    type: 'Analitik',
    purpose:
      'Google Analytics oturum durumunu tutar. Yalnızca onay verirseniz oluşturulur.',
    duration: '2 yıl',
  },
]

export default function CookiePolicyPage() {
  useSeo({
    title: 'Çerez Politikası',
    description:
      'Influencer Türkiye internet sitesinde kullanılan çerezler, kullanım amaçları, saklama süreleri ve çerez tercihinizi nasıl değiştirebileceğiniz.',
    canonical: '/cerez-politikasi',
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
              <Cookie className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Çerez Politikası
              </h1>
              <p className="text-gray-600 mt-2">Son güncelleme: {LAST_UPDATED}</p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-10 space-y-8 text-gray-700 leading-relaxed">
            <div>
              <p>
                Bu politika, influencerturkiye.com adresinde kullanılan çerezleri ve benzeri
                teknolojileri; bunları hangi amaçla kullandığımızı, ne kadar süreyle
                sakladığımızı ve tercihinizi nasıl değiştirebileceğinizi açıklar. Kişisel
                verilerinizin işlenmesine ilişkin genel bilgilendirme için{' '}
                <Link to="/kvkk" className="text-red-600 hover:text-red-700 underline">
                  Kişisel Verilerin Korunması
                </Link>{' '}
                sayfamızı inceleyebilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Çerez nedir?</h2>
              <p>
                Çerez, bir internet sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük
                bir metin dosyasıdır. Siteler çerezleri, ziyaretinizi hatırlamak ve sitenin
                düzgün çalışmasını sağlamak için kullanır. Bu politikada, çerezlerle aynı işi
                gören <strong>yerel depolama (localStorage)</strong> kayıtları da çerez olarak
                ele alınmaktadır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sitemizde hangi çerezleri kullanıyoruz?
              </h2>
              <p className="mb-4">
                Sitemizde iki tür kayıt bulunur: sitenin çalışması için gereken{' '}
                <strong>zorunlu</strong> kayıtlar ve ziyaretçi istatistiklerini ölçen{' '}
                <strong>analitik</strong> çerezler.
              </p>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white not-prose">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-5 py-3 font-semibold text-gray-900 align-top">Ad</th>
                      <th className="px-5 py-3 font-semibold text-gray-900 align-top">Tür</th>
                      <th className="px-5 py-3 font-semibold text-gray-900 align-top">Amaç</th>
                      <th className="px-5 py-3 font-semibold text-gray-900 align-top">Süre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {COOKIES.map((cookie) => (
                      <tr key={cookie.name}>
                        <td className="px-5 py-4 align-top font-medium text-gray-900 whitespace-nowrap">
                          {cookie.name}
                        </td>
                        <td className="px-5 py-4 align-top text-gray-600 whitespace-nowrap">
                          {cookie.type}
                        </td>
                        <td className="px-5 py-4 align-top text-gray-600">{cookie.purpose}</td>
                        <td className="px-5 py-4 align-top text-gray-600 whitespace-nowrap">
                          {cookie.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                Sitemizde reklam, profilleme veya sosyal medya takip çerezi kullanılmamaktadır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hukuki dayanak nedir?</h2>
              <p className="mb-4">
                Zorunlu kayıtlar, talep ettiğiniz hizmetin sunulabilmesi için teknik olarak
                gereklidir; bunlar 6698 sayılı Kanun'un 5/2-(f) maddesindeki meşru menfaat
                hukuki sebebine dayanır ve devre dışı bırakılamaz.
              </p>
              <p>
                Analitik çerezler ise yalnızca <strong>açık rızanıza</strong> (m.5/1)
                dayanılarak çalışır. Onay vermediğiniz sürece Google Analytics betiği hiç
                yüklenmez ve tarayıcınıza analitik çerez yazılmaz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Analitik çerezler ve yurt dışına aktarım
              </h2>
              <p>
                Ziyaretçi istatistiklerini ölçmek için Google Analytics 4 kullanıyoruz. Onay
                vermeniz hâlinde, ziyaretinize ilişkin veriler (IP adresi, tarayıcı ve cihaz
                bilgisi, görüntülenen sayfalar) sunucuları yurt dışında bulunan Google'a
                aktarılır. Bu aktarım, KVKK m.9 kapsamında; Kurul tarafından bir yeterlilik
                kararı bulunması hâlinde bu karara, aksi hâlde standart sözleşme ya da diğer
                uygun güvencelerden birine veya açık rızanıza dayanılarak gerçekleştirilir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Çerez tercihinizi nasıl değiştirirsiniz?
              </h2>
              <p className="mb-4">
                Siteyi ilk açtığınızda çıkan çerez bandından analitik çerezleri kabul edebilir
                veya reddedebilirsiniz. Tercihinizi daha sonra da değiştirebilirsiniz: her
                sayfanın en altındaki <strong>“Çerez Tercihleri”</strong> bağlantısına
                tıkladığınızda bant yeniden açılır.
              </p>
              <p className="mb-4">
                Onayı geri aldığınızda ölçüm durur ve daha önce yazılmış analitik çerezler
                silinir. Zorunlu kayıtlar ise sitenin çalışması için gereklidir; bunları
                engellerseniz üye girişi gibi bölümler çalışmayabilir.
              </p>
              <p>
                Ayrıca tarayıcınızın ayarlarından çerezleri tümüyle engelleyebilir, mevcut
                çerezleri silebilir veya Google'ın{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-700 underline"
                >
                  devre dışı bırakma eklentisini
                </a>{' '}
                kurarak Google Analytics ölçümünün dışında kalabilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Haklarınız ve iletişim</h2>
              <p>
                Çerezler aracılığıyla işlenen kişisel verilerinize ilişkin KVKK Madde 11
                haklarınızı{' '}
                <Link to="/kvkk" className="text-red-600 hover:text-red-700 underline">
                  Kişisel Verilerin Korunması
                </Link>{' '}
                sayfasında açıklanan yollarla kullanabilirsiniz. Bu politikayla ilgili
                sorularınız için{' '}
                <a
                  href="mailto:hello@influencerturkiye.com"
                  className="text-red-600 hover:text-red-700 underline"
                >
                  hello@influencerturkiye.com
                </a>{' '}
                adresinden bize ulaşabilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bu politikadaki değişiklikler
              </h2>
              <p>
                Sitede kullanılan çerezler değiştiğinde bu politika güncellenir ve güncel metin
                bu sayfada yayımlanır. Yürürlük tarihini sayfanın başındaki “son güncelleme”
                bilgisinden takip edebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
