// Portföy galerisindeki içerik üreticilerinin başlangıç listesi.
// Bu veri hem 20260826000004_portfolio_creators migration'ı hem de seed
// tarafından kullanılıyor: migration mevcut kurulumlara tabloyu doldururken,
// seed sıfırdan kurulumlarda aynı listeyi yazıyor.
//
// Görsel dosya adları (public/portf) her zaman Instagram kullanıcı adıyla
// birebir aynı değil; bu yüzden `handle` ve `image` ayrı tutuluyor.
const portfolioCreators = [
  { handle: 'aselkirazz', image: '/portf/aselkirazz.webp', instagram: 'https://www.instagram.com/aselkirazz' },
  { handle: 'asenaaolgun', image: '/portf/asenaaolgun.webp', instagram: 'https://www.instagram.com/asenaaolgun' },
  { handle: 'atalaraleyna', image: '/portf/atalaraleyna.webp', instagram: 'https://www.instagram.com/atalaraleyna' },
  { handle: 'aytachalideacar', image: '/portf/aytachalideacar.webp', instagram: 'https://www.instagram.com/aytachalideacar' },
  { handle: 'bagtubaa', image: '/portf/bagtubaa.webp', instagram: 'https://www.instagram.com/bagtubaa' },
  { handle: 'berrakberroo', image: '/portf/berrakberroo.webp', instagram: 'https://www.instagram.com/berrakberroo' },
  { handle: 'betizmmm', image: '/portf/betizmmm.webp', instagram: 'https://www.instagram.com/betizmmm' },
  { handle: 'boncuksara', image: '/portf/boncuksara.webp', instagram: 'https://www.instagram.com/boncuksara' },
  { handle: 'clburakkk', image: '/portf/clburakkk.webp', instagram: 'https://www.instagram.com/clburakkk' },
  { handle: 'dilarapusa', image: '/portf/dilarapusa.webp', instagram: 'https://www.instagram.com/dilarapusa' },
  { handle: 'dr.ilaydasimaygul', image: '/portf/dr_ilaydasimaygul.webp', instagram: 'https://www.instagram.com/dr.ilaydasimaygul' },
  { handle: 'duygu', image: '/portf/duygu.webp', instagram: 'https://www.instagram.com/duygu' },
  { handle: 'ecmelrumeysa', image: '/portf/ecmelrumeysa.webp', instagram: 'https://www.instagram.com/ecmelrumeysa' },
  { handle: 'emure_ozd', image: '/portf/emure_ozd.webp', instagram: 'https://www.instagram.com/emure_ozd' },
  { handle: 'hatipoglugizem', image: '/portf/hatipoglugizem.webp', instagram: 'https://www.instagram.com/hatipoglugizem' },
  { handle: 'jankovicsamet', image: '/portf/jankovicsamet.webp', instagram: 'https://www.instagram.com/jankovicsamet' },
  { handle: 'leylaa_gunay', image: '/portf/leyla_gunay.webp', instagram: 'https://www.instagram.com/leylaa_gunay' },
  { handle: 'mayabasol', image: '/portf/mayabasol.webp', instagram: 'https://www.instagram.com/mayabasol' },
  { handle: 'melekicmeli', image: '/portf/melekicmeli.webp', instagram: 'https://www.instagram.com/melekicmeli' },
  { handle: 'nnurpehlivan', image: '/portf/nnurpehlivan.webp', instagram: 'https://www.instagram.com/nnurpehlivan' },
  { handle: 'nursen_senyurt', image: '/portf/nursen_senyurt.webp', instagram: 'https://www.instagram.com/nursen_senyurt' },
  { handle: 'omer.olguun', image: '/portf/omer_olgun.webp', instagram: 'https://www.instagram.com/omer.olguun' },
  { handle: 'ozlemmekik', image: '/portf/ozlemmekik.webp', instagram: 'https://www.instagram.com/ozlemmekik' },
  { handle: 'saancez', image: '/portf/saancez.webp', instagram: 'https://www.instagram.com/saancez' },
  { handle: 'sahinoguzofficial', image: '/portf/sahinoguzoffical.webp', instagram: 'https://www.instagram.com/sahinoguzofficial' },
  { handle: 'senasuraeerr', image: '/portf/senasuraeerr.webp', instagram: 'https://www.instagram.com/senasuraeerr' },
  { handle: 'serapinakappa', image: '/portf/serapinakappa.webp', instagram: 'https://www.instagram.com/serapinakappa' },
  { handle: 'sukrankaymak', image: '/portf/sukrankaymak.webp', instagram: 'https://www.instagram.com/sukrankaymak' },
  { handle: 'umrantoo', image: '/portf/umrantoo.webp', instagram: 'https://www.instagram.com/umrantoo' },
  { handle: 'uzunmakarna', image: '/portf/uzunmakarna.webp', instagram: 'https://www.instagram.com/uzunmakarna' },
  { handle: 'yareento', image: '/portf/yareento.webp', instagram: 'https://www.instagram.com/yareento' },
  { handle: 'zey_zor', image: '/portf/zey_zor.webp', instagram: 'https://www.instagram.com/zey_zor' },
]

module.exports = { portfolioCreators }
