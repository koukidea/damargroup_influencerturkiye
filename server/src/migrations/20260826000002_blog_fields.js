// Blog (Kaynaklar) bölümünün eksik alanları:
// - Kapak görseli, yazar, etiket → kart ve detay sayfası için içerik zenginliği
// - status → taslak/yayında ayrımı; artık kaydetmek yayınlamak anlamına gelmiyor
// - seo_title / seo_description → arama sonucunda görünen metnin elle kontrolü
// - views / updated_at → yayın performansı ve "güncellenme" bilgisi
//
// Not: MySQL'de string varsayılanları utf8mb4 tablo ayarını miras alır; tablo
// zaten ilk migration'da utf8mb4 olarak oluşturuluyor.

exports.up = async function (knex) {
  await knex.schema.alterTable('resources', (table) => {
    table.string('cover_image', 500).nullable()
    table.string('cover_alt', 255).nullable()
    table.string('author', 120).notNullable().defaultTo('Influencer Türkiye')
    table.string('tags', 500).nullable()
    table.string('status', 20).notNullable().defaultTo('published')
    table.string('seo_title', 255).nullable()
    table.string('seo_description', 500).nullable()
    table.integer('views').unsigned().notNullable().defaultTo(0)
    table.timestamp('updated_at').nullable()
  })

  // Herkese açık liste sorgusu her zaman status + date üzerinden filtreliyor.
  await knex.schema.alterTable('resources', (table) => {
    table.index(['status', 'date'], 'resources_status_date_idx')
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('resources', (table) => {
    table.dropIndex(['status', 'date'], 'resources_status_date_idx')
  })
  await knex.schema.alterTable('resources', (table) => {
    table.dropColumn('cover_image')
    table.dropColumn('cover_alt')
    table.dropColumn('author')
    table.dropColumn('tags')
    table.dropColumn('status')
    table.dropColumn('seo_title')
    table.dropColumn('seo_description')
    table.dropColumn('views')
    table.dropColumn('updated_at')
  })
}
