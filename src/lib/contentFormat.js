// Yazı içeriği için markdown'ın güvenli ve dar bir alt kümesi.
//
// Neden HTML değil: içerik admin panelinden geliyor ve doğrudan HTML basmak
// (dangerouslySetInnerHTML) XSS riski açar. Bunun yerine metni bloklara ve
// satır içi parçalara ayırıp React elemanı olarak render ediyoruz — hiçbir
// durumda ham HTML çalıştırılmaz.
//
// Blok düzeyi:  ## H2 · ### H3 · > alıntı · - madde · 1. numaralı madde
//               ![alt](görsel) · --- ayraç · ```kod bloğu``` · boş satır = paragraf
// Satır içi:    **kalın** · *eğik* · `kod` · [bağlantı metni](adres)

const ORDERED_ITEM = /^(\d+)[.)]\s+(.*)$/
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/
const FENCE = /^```\s*([a-zA-Z0-9-]*)\s*$/

// javascript: gibi şemaları engeller. İzin verilmeyen adres, bağlantı yerine
// düz metin olarak gösterilir — sessizce tıklanabilir bir tuzağa dönüşmez.
export function safeHref(raw) {
  const href = String(raw ?? '').trim()
  if (!href) return null
  if (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href)) return href
  return null
}

export function safeImageSrc(raw) {
  const src = String(raw ?? '').trim()
  if (!src) return null
  if (/^(https?:\/\/|\/(?!\/)|data:image\/)/i.test(src)) return src
  return null
}

/* --------------------------------- Satır içi -------------------------------- */

// Kalın, *eğikten* önce denenmeli: ikisi de "*" ile başlıyor ve aynı konumda
// eşleşiyorlar, listede önce gelen kazanıyor.
const INLINE_RULES = [
  { type: 'code', re: /`([^`\n]+)`/ },
  { type: 'link', re: /\[([^\]\n]+)\]\(([^)\s]+)\)/ },
  { type: 'strong', re: /\*\*([^*\n]+)\*\*/ },
  { type: 'strong', re: /__([^_\n]+)__/ },
  { type: 'em', re: /\*([^*\n]+)\*/ },
  { type: 'em', re: /_([^_\n]+)_/ },
]

export function parseInline(text) {
  const source = String(text ?? '')
  if (!source) return []

  let earliest = null
  for (const rule of INLINE_RULES) {
    const match = rule.re.exec(source)
    if (match && (earliest === null || match.index < earliest.match.index)) {
      earliest = { rule, match }
    }
  }

  if (!earliest) return [{ type: 'text', value: source }]

  const { rule, match } = earliest
  const before = source.slice(0, match.index)
  const after = source.slice(match.index + match[0].length)
  const tokens = []

  if (before) tokens.push(...parseInline(before))

  if (rule.type === 'code') {
    tokens.push({ type: 'code', value: match[1] })
  } else if (rule.type === 'link') {
    const href = safeHref(match[2])
    if (href) {
      tokens.push({ type: 'link', href, children: parseInline(match[1]) })
    } else {
      // Güvenli olmayan adres: bağlantı kurma, yazılanı olduğu gibi göster.
      tokens.push({ type: 'text', value: match[0] })
    }
  } else {
    tokens.push({ type: rule.type, children: parseInline(match[1]) })
  }

  if (after) tokens.push(...parseInline(after))
  return tokens
}

/* ---------------------------------- Bloklar --------------------------------- */

export function parseContent(text) {
  const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []

  let paragraph = []
  let list = null // { ordered, items }
  let quote = []
  let fence = null // { lang, lines }

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'p', text: paragraph.join(' ').trim() })
      paragraph = []
    }
  }
  const flushList = () => {
    if (list?.items.length) blocks.push({ type: 'list', ordered: list.ordered, items: list.items })
    list = null
  }
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ type: 'quote', text: quote.join(' ').trim() })
      quote = []
    }
  }
  const flushAll = () => {
    flushParagraph()
    flushList()
    flushQuote()
  }

  for (const rawLine of lines) {
    // Kod bloğunun içindeyken satırlar hiç yorumlanmaz.
    if (fence) {
      if (FENCE.test(rawLine.trim())) {
        blocks.push({ type: 'code', lang: fence.lang, code: fence.lines.join('\n') })
        fence = null
      } else {
        fence.lines.push(rawLine)
      }
      continue
    }

    const line = rawLine.trim()

    const fenceMatch = FENCE.exec(line)
    if (fenceMatch) {
      flushAll()
      fence = { lang: fenceMatch[1] || '', lines: [] }
      continue
    }

    if (!line) {
      flushAll()
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushAll()
      blocks.push({ type: 'divider' })
      continue
    }

    const imageMatch = IMAGE_LINE.exec(line)
    if (imageMatch) {
      flushAll()
      const src = safeImageSrc(imageMatch[2])
      if (src) blocks.push({ type: 'image', src, alt: imageMatch[1] || '' })
      continue
    }

    if (line.startsWith('### ')) {
      flushAll()
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
      continue
    }
    if (line.startsWith('## ')) {
      flushAll()
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
      continue
    }
    if (line.startsWith('> ')) {
      flushParagraph()
      flushList()
      quote.push(line.slice(2).trim())
      continue
    }

    const orderedMatch = ORDERED_ITEM.exec(line)
    if (orderedMatch) {
      flushParagraph()
      flushQuote()
      if (!list?.ordered) {
        flushList()
        list = { ordered: true, items: [] }
      }
      list.items.push(orderedMatch[2].trim())
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph()
      flushQuote()
      if (list && list.ordered) flushList()
      if (!list) list = { ordered: false, items: [] }
      list.items.push(line.replace(/^[-*]\s+/, '').trim())
      continue
    }

    flushList()
    flushQuote()
    paragraph.push(line)
  }

  // Kapatılmamış kod bloğu kaybolmasın.
  if (fence) blocks.push({ type: 'code', lang: fence.lang, code: fence.lines.join('\n') })
  flushAll()

  return blocks
}

/* --------------------------------- Yardımcılar -------------------------------- */

// Meta açıklama ve okuma süresi hesabı için biçimlendirmeden arındırılmış metin.
export function toPlainText(text) {
  return parseContent(text)
    .map((block) => {
      if (block.type === 'list') return block.items.join(' ')
      if (block.type === 'image' || block.type === 'divider' || block.type === 'code') return ''
      return block.text || ''
    })
    .join(' ')
    .replace(/\*\*|__|[`*_]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncate(text, max = 160) {
  const clean = String(text ?? '').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

// Türkçe metinde ortalama okuma hızı ~200 kelime/dk.
export function estimateReadTime(text) {
  const words = toPlainText(text).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} dk`
}

// İçindekiler bağlantıları ve başlık id'leri için.
// Türkçe harfler toLowerCase'den ÖNCE çevrilmeli: "İ".toLowerCase() birleşik
// noktalı bir "i" üretir ve id "i-kinci" gibi bölünür.
const TR_LOWER = {
  ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', i: 'i',
  Ç: 'c', Ğ: 'g', İ: 'i', I: 'i', Ö: 'o', Ş: 's', Ü: 'u',
}

export function headingId(text, index) {
  const base = String(text ?? '')
    .split('')
    .map((ch) => TR_LOWER[ch] ?? ch)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base ? `${base}-${index}` : `baslik-${index}`
}
