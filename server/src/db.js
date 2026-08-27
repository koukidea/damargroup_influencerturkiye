const knex = require('knex')
const config = require('../knexfile.js')

const environment = process.env.NODE_ENV || 'development'
const environmentConfig = config[environment]

// knexfile yalnizca development ve production anahtarlarini taniyor. NODE_ENV
// bunlardan biri degilse (ornegin "prod" ya da "staging") knex(undefined)
// cagrilir ve ortaya yapilandirmayla ilgisi anlasilmayan bir hata cikar.
if (!environmentConfig) {
  console.error(
    `\nVERITABANI YAPILANDIRMA HATASI: NODE_ENV="${environment}" taninmiyor\n\n` +
      `server/.env icinde NODE_ENV su degerlerden biri olmali: ${Object.keys(config).join(', ')}\n`
  )
  process.exit(1)
}

const db = knex(environmentConfig)

module.exports = db
