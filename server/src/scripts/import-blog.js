#!/usr/bin/env node
// Kaynaklar bölümünün kategori yapısını ve başlangıç yazılarını MEVCUT bir
// veritabanına ekler. `npm run seed`den farkı: hiçbir şeyi silmez.
//
//   cd server && npm run blog:import
//
// Tekrar tekrar çalıştırılabilir:
//   - Kategori varsa güncellenir, yoksa eklenir
//   - Yazı slug'ı zaten varsa atlanır (elle yaptığınız düzenlemeler korunur)
//   - Eski kategorilerdeki yazılar yeni kategorilere taşınır
//   - Boşalan eski kategoriler silinir

require('dotenv').config()
const db = require('../db.js')
const {
  blogCategories,
  legacyCategoryMap,
  postCategoryOverrides,
} = require('../data/blogCategories.js')
const { blogPosts } = require('../data/blogPosts.js')

async function upsertCategories() {
  let added = 0
  let updated = 0

  for (const [index, category] of blogCategories.entries()) {
    const existing = await db('resource_categories').where({ slug: category.slug }).first()
    if (existing) {
      await db('resource_categories').where({ id: existing.id }).update({
        label: category.label,
        icon: category.icon,
        color: category.color,
        bg: category.bg,
        description: category.description,
        position: index,
      })
      updated++
    } else {
      await db('resource_categories').insert({ ...category, position: index })
      added++
    }
  }

  console.log(`Kategoriler: ${added} eklendi, ${updated} güncellendi.`)
}

async function remapLegacyPosts() {
  let moved = 0

  for (const [oldSlug, newSlug] of Object.entries(legacyCategoryMap)) {
    const count = await db('resources')
      .where({ category_slug: oldSlug })
      .update({ category_slug: newSlug })
    if (count) {
      console.log(`  "${oldSlug}" → "${newSlug}": ${count} yazı taşındı.`)
      moved += count
    }
  }

  // Konusu gereği başka kategoriye ait olan yazılar. Slug bazlı olduğu için
  // betik tekrar çalıştırıldığında da doğru sonucu verir.
  for (const [postSlug, categorySlug] of Object.entries(postCategoryOverrides)) {
    const count = await db('resources').where({ slug: postSlug }).update({
      category_slug: categorySlug,
    })
    if (count) console.log(`  "${postSlug}" → "${categorySlug}" kategorisine alındı.`)
  }

  // Kategorisi artık geçersiz kalan yazı varsa (elle eklenmiş eski slug)
  // hiçbiri kategorisiz kalmasın diye Rehberler'e alınır.
  const validSlugs = blogCategories.map((c) => c.slug)
  const orphans = await db('resources').whereNotIn('category_slug', validSlugs).update({
    category_slug: 'rehberler',
  })
  if (orphans) console.log(`  Kategorisiz kalan ${orphans} yazı "rehberler" altına alındı.`)

  console.log(`Yazı taşıma: toplam ${moved + orphans} yazı yeni yapıya geçti.`)
}

async function insertNewPosts() {
  let added = 0
  let skipped = 0

  for (const post of blogPosts) {
    const existing = await db('resources').where({ slug: post.slug }).first()
    if (existing) {
      skipped++
      continue
    }
    await db('resources').insert({ ...post, status: post.status || 'published' })
    added++
  }

  console.log(`Yazılar: ${added} eklendi, ${skipped} zaten mevcut olduğu için atlandı.`)
}

async function removeEmptyLegacyCategories() {
  let removed = 0

  for (const oldSlug of Object.keys(legacyCategoryMap)) {
    // Yeni yapıda aynı slug kullanılıyorsa dokunma.
    if (blogCategories.some((c) => c.slug === oldSlug)) continue

    const [{ count }] = await db('resources').where({ category_slug: oldSlug }).count({ count: '*' })
    if (Number(count) > 0) {
      console.log(`  "${oldSlug}" silinmedi: hâlâ ${count} yazı bağlı.`)
      continue
    }
    const deleted = await db('resource_categories').where({ slug: oldSlug }).del()
    if (deleted) removed++
  }

  console.log(`Eski kategoriler: ${removed} tanesi (boş oldukları için) silindi.`)
}

async function main() {
  console.log('Kaynaklar içeriği içe aktarılıyor…\n')

  await upsertCategories()
  await remapLegacyPosts()
  await insertNewPosts()
  await removeEmptyLegacyCategories()

  const [{ total }] = await db('resources').count({ total: '*' })
  const [{ drafts }] = await db('resources').where({ status: 'draft' }).count({ drafts: '*' })

  console.log(`\nTamamlandı. Toplam ${total} yazı (${drafts} taslak).`)
  if (Number(drafts) > 0) {
    console.log(
      'Taslaklar sitede, listede ve sitemap\'te görünmez.\n' +
        'Yayına almak için admin panelinden durumlarını "Yayında" yapın.'
    )
  }
}

main()
  .then(() => db.destroy())
  .catch(async (err) => {
    console.error('\nHATA:', err.message)
    await db.destroy()
    process.exit(1)
  })
