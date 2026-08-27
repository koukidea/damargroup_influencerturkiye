// Portföy sayfasındaki içerik üretici galerisi eskiden frontend'de
// (src/data/portfolio.js) sabit bir listeydi; her değişiklik kod düzenlemesi ve
// yeni build gerektiriyordu. Artık veritabanından geliyor ve yönetim panelinden
// düzenlenebiliyor.
//
// Tablo oluşturulduktan sonra mevcut 32 kayıt bir kez buraya taşınıyor. Bu iş
// seed'e bırakılamazdı: seed tabloları silip yeniden yazıyor, dolayısıyla
// canlıda panelden girilmiş içeriği yok ederdi.

const { portfolioCreators } = require('../data/portfolioCreators.js')

exports.up = async function (knex) {
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

  await knex('portfolio_creators').insert(
    portfolioCreators.map((creator, i) => ({ ...creator, position: i }))
  )
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('portfolio_creators')
}
