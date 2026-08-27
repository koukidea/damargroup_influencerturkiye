// Kategori açıklaması: menüdeki açılır listede ve kategori filtresinde
// "bu kategoride ne var?" sorusuna cevap veren kısa metin.

exports.up = async function (knex) {
  await knex.schema.alterTable('resource_categories', (table) => {
    table.string('description', 300).nullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('resource_categories', (table) => {
    table.dropColumn('description')
  })
}
