// Anasayfa kartları (influencers) ile portföy galerisi (portfolio_creators)
// eskiden iki ayrı tablo ve panelde iki ayrı sayfaydı. Aynı kişi iki yerde de
// görünecekse iki kez girilmek zorundaydı. Artık tek tablo var: her kayıt
// hangi sayfalarda görüneceğini kendi üstünde taşıyor.
//
//   show_on_home       → anasayfadaki kart slider'ı (takipçi/etkileşim ister)
//   show_in_portfolio  → portföy sayfasındaki "Kampanyalarımızda Yer Alan İsimler"
//
// Galeri kayıtları buraya taşınırken Instagram kullanıcı adı eşleşenler ayrı
// satır açılmadan mevcut influencer'a bağlanıyor; böylece panelde çift kayıt
// görünmüyor.

const { normalizeHandle } = require('../lib/handle.js')

exports.up = async function (knex) {
  await knex.schema.alterTable('influencers', (table) => {
    table.string('handle').notNullable().defaultTo('')
    table.boolean('show_on_home').notNullable().defaultTo(true)
    table.boolean('show_in_portfolio').notNullable().defaultTo(false)
  })

  const influencers = await knex('influencers').select('*').orderBy('position', 'asc')
  for (const inf of influencers) {
    await knex('influencers')
      .where({ id: inf.id })
      .update({ handle: normalizeHandle(inf.instagram) })
  }

  const hasGallery = await knex.schema.hasTable('portfolio_creators')
  if (hasGallery) {
    const creators = await knex('portfolio_creators').select('*').orderBy('position', 'asc')
    const byHandle = new Map(
      influencers.map((inf) => [normalizeHandle(inf.instagram).toLowerCase(), inf])
    )
    let position = influencers.length

    for (const creator of creators) {
      const handle = normalizeHandle(creator.handle || creator.instagram)
      const existing = byHandle.get(handle.toLowerCase())
      if (existing) {
        await knex('influencers').where({ id: existing.id }).update({ show_in_portfolio: true })
        continue
      }
      await knex('influencers').insert({
        name: handle,
        handle,
        image: creator.image,
        followers: '',
        engagement: '',
        instagram: creator.instagram || `https://www.instagram.com/${handle}`,
        position: position++,
        show_on_home: false,
        show_in_portfolio: true,
      })
    }

    await knex.schema.dropTable('portfolio_creators')
  }
}

exports.down = async function (knex) {
  const isMysql = knex.client.config.client === 'mysql2'

  await knex.schema.createTable('portfolio_creators', (table) => {
    if (isMysql) {
      table.charset('utf8mb4')
      table.collate('utf8mb4_unicode_ci')
    }
    table.increments('id').primary()
    table.string('handle').notNullable()
    table.string('image').notNullable()
    table.string('instagram').notNullable()
    table.integer('position').notNullable().defaultTo(0)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  const gallery = await knex('influencers')
    .where({ show_in_portfolio: true })
    .orderBy('position', 'asc')
  if (gallery.length) {
    await knex('portfolio_creators').insert(
      gallery.map((inf, i) => ({
        handle: inf.handle,
        image: inf.image,
        instagram: inf.instagram,
        position: i,
      }))
    )
  }
  // Yalnızca galeriye ait olan satırlar anasayfa tablosunda anlamsız kalır.
  await knex('influencers').where({ show_on_home: false }).del()

  await knex.schema.alterTable('influencers', (table) => {
    table.dropColumn('handle')
    table.dropColumn('show_on_home')
    table.dropColumn('show_in_portfolio')
  })
}
