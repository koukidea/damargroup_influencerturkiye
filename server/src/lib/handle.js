// Panelde kullanıcı adı alanına "@ad", "instagram.com/ad" ya da tam adres
// yapıştırılması çok olası. Hepsini sade kullanıcı adına indiriyoruz; aksi
// halde galeride "@https://www.instagram.com/ad" gibi etiketler çıkardı.
function normalizeHandle(value) {
  // Baştaki "@" adres ayıklamasından önce atılıyor: "@https://instagram.com/ad"
  // gibi bir yapıştırmada protokol kalıbı aksi hâlde eşleşmez, kullanıcı adı
  // "https:" olarak kaydedilirdi.
  const raw = String(value ?? '').trim().replace(/^@+/, '')
  if (!raw) return ''
  const withoutHost = raw
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^instagram\.com\//i, '')
  return withoutHost.split(/[/?#]/)[0].replace(/^@+/, '').trim()
}

module.exports = { normalizeHandle }
