import { Check } from 'lucide-react'
import { parseContent, parseInline, headingId } from '../../lib/contentFormat.js'

// Satır içi parçaları React elemanına çevirir. Hiçbir aşamada ham HTML
// kullanılmaz — içerik yönetici panelinden gelse de XSS mümkün değil.
function renderInline(tokens, keyPrefix = 'i') {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.type === 'text') return <span key={key}>{token.value}</span>
    if (token.type === 'strong') {
      return (
        <strong key={key} className="font-semibold text-gray-900">
          {renderInline(token.children, key)}
        </strong>
      )
    }
    if (token.type === 'em') return <em key={key}>{renderInline(token.children, key)}</em>
    if (token.type === 'code') {
      return (
        <code
          key={key}
          className="px-1.5 py-0.5 rounded-md bg-gray-100 text-red-700 text-[0.9em] font-mono"
        >
          {token.value}
        </code>
      )
    }
    if (token.type === 'link') {
      const external = /^https?:\/\//i.test(token.href)
      return (
        <a
          key={key}
          href={token.href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-red-600 font-medium underline underline-offset-2 decoration-red-300 hover:decoration-red-600 transition-colors"
        >
          {renderInline(token.children, key)}
        </a>
      )
    }
    return null
  })
}

function Inline({ text, keyPrefix }) {
  return <>{renderInline(parseInline(text), keyPrefix)}</>
}

function Block({ block, index, color }) {
  const key = `b-${index}`

  switch (block.type) {
    case 'h2':
      return (
        // id'ler paylaşılabilir bölüm bağlantıları ve Google'ın "bu sayfada
        // atla" bağlantıları için duruyor.
        <h2
          id={headingId(block.text, index)}
          className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4 scroll-mt-24"
        >
          <Inline text={block.text} keyPrefix={key} />
        </h2>
      )

    case 'h3':
      return (
        <h3
          id={headingId(block.text, index)}
          className="text-lg md:text-xl font-semibold text-gray-900 mt-8 mb-3 scroll-mt-24"
        >
          <Inline text={block.text} keyPrefix={key} />
        </h3>
      )

    case 'quote':
      return (
        <blockquote
          className="my-6 pl-5 py-2 border-l-4 text-gray-700 italic leading-relaxed"
          style={{ borderColor: color.color, backgroundColor: color.bg }}
        >
          <Inline text={block.text} keyPrefix={key} />
        </blockquote>
      )

    case 'list':
      if (block.ordered) {
        return (
          <ol className="space-y-3 my-6">
            {block.items.map((item, itemIndex) => (
              // Aynı metin iki kez geçebildiği için sıra numarası anahtara dahil.
              <li key={`${key}-${itemIndex}`} className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                  style={{ backgroundColor: color.bg, color: color.color }}
                >
                  {itemIndex + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">
                  <Inline text={item} keyPrefix={`${key}-${itemIndex}`} />
                </span>
              </li>
            ))}
          </ol>
        )
      }
      return (
        <ul className="space-y-3 my-6">
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`} className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: color.bg }}
              >
                <Check className="w-3 h-3" style={{ color: color.color }} />
              </span>
              <span className="text-gray-700 leading-relaxed">
                <Inline text={item} keyPrefix={`${key}-${itemIndex}`} />
              </span>
            </li>
          ))}
        </ul>
      )

    case 'image':
      return (
        <figure className="my-8">
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-2xl border border-gray-200"
          />
          {block.alt && (
            <figcaption className="text-sm text-gray-500 text-center mt-3">{block.alt}</figcaption>
          )}
        </figure>
      )

    case 'code':
      return (
        <pre className="my-6 p-4 rounded-2xl bg-gray-900 text-gray-100 text-sm overflow-x-auto">
          <code>{block.code}</code>
        </pre>
      )

    case 'divider':
      return <hr className="my-10 border-gray-200" />

    default:
      return (
        <p className="text-gray-700 leading-relaxed mb-5">
          <Inline text={block.text} keyPrefix={key} />
        </p>
      )
  }
}

export default function ArticleContent({ content, color }) {
  const blocks = parseContent(content)
  return (
    <div className="article-content">
      {blocks.map((block, index) => (
        <Block key={index} block={block} index={index} color={color} />
      ))}
    </div>
  )
}
