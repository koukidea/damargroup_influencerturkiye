// MySQL/MariaDB uyumluluğu:
// - Foreign key veren sütunlar unsigned olmalı (increments() int unsigned üretir).
// - Tablolar açıkça utf8mb4 olmalı (emoji avatar + Türkçe karakterler için).
// - Makale içeriği TEXT'e (65 KB) sığmayabilir, mediumtext kullanılıyor.

exports.up = async function (knex) {
  const isMysql = knex.client.config.client === 'mysql2'

  const withCharset = (table) => {
    if (isMysql) {
      table.charset('utf8mb4')
      table.collate('utf8mb4_unicode_ci')
    }
  }

  await knex.schema
    .createTable('users', (table) => {
      withCharset(table)
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('email').notNullable().unique()
      table.string('password_hash').notNullable()
      table.string('role').notNullable().defaultTo('user')
      table.string('avatar').notNullable().defaultTo('😀')
      table.timestamp('created_at').defaultTo(knex.fn.now())
    })

    .createTable('influencers', (table) => {
      withCharset(table)
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('image').notNullable()
      table.string('followers').notNullable()
      table.string('engagement').notNullable()
      table.string('instagram').notNullable()
      table.integer('position').notNullable().defaultTo(0)
      table.timestamp('created_at').defaultTo(knex.fn.now())
    })

    .createTable('services', (table) => {
      withCharset(table)
      table.increments('id').primary()
      table.string('slug').notNullable().unique()
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.string('icon').notNullable()
      table.integer('position').notNullable().defaultTo(0)
      table.timestamp('created_at').defaultTo(knex.fn.now())
    })

    .createTable('service_items', (table) => {
      withCharset(table)
      table.increments('id').primary()
      table
        .integer('service_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('services')
        .onDelete('CASCADE')
      table.string('text').notNullable()
      table.integer('position').notNullable().defaultTo(0)
    })

    .createTable('resource_categories', (table) => {
      withCharset(table)
      table.increments('id').primary()
      table.string('slug').notNullable().unique()
      table.string('label').notNullable()
      table.string('icon').notNullable()
      table.string('color').notNullable()
      table.string('bg').notNullable()
      table.integer('position').notNullable().defaultTo(0)
    })

    .createTable('resources', (table) => {
      withCharset(table)
      table.increments('id').primary()
      table.string('slug').notNullable().unique()
      table.string('title').notNullable()
      table
        .string('category_slug')
        .notNullable()
        .references('slug')
        .inTable('resource_categories')
        .onUpdate('CASCADE')
      table.text('excerpt').notNullable()
      table.string('read_time').notNullable()
      table.date('date').notNullable()
      table.text('content', 'mediumtext').notNullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
    })

    .createTable('applications', (table) => {
      withCharset(table)
      table.increments('id').primary()
      table.string('type').notNullable() // 'influencer' | 'brand' | 'contact'
      table.text('payload', 'mediumtext').notNullable() // JSON.stringify of form fields
      table.timestamp('created_at').defaultTo(knex.fn.now())
    })
}

exports.down = async function (knex) {
  await knex.schema
    .dropTableIfExists('applications')
    .dropTableIfExists('resources')
    .dropTableIfExists('resource_categories')
    .dropTableIfExists('service_items')
    .dropTableIfExists('services')
    .dropTableIfExists('influencers')
    .dropTableIfExists('users')
}
