// Panel listelerinde ortak arama yardımcıları.

// Türkçe'ye duyarlı küçük harf: "İlayda" araması "ilayda" ile eşleşsin,
// "ISIL" da "ısıl" olsun. toLowerCase tek başına İ→i̇ (noktalı) üretir.
export function fold(value) {
  return String(value ?? '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
}

// Sorgudaki her kelime metinde geçiyorsa eşleşir; kelime sırası önemsiz.
export function matchesQuery(text, query) {
  const terms = fold(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const haystack = fold(text)
  return terms.every((term) => haystack.includes(term))
}
