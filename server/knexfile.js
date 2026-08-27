require('dotenv').config()

// .env'den okunan değerlerde görünmeyen boşluk sık rastlanan bir hata kaynağı:
// "mysql2 " ile "mysql2" farklı sayılır ve uygulama sessizce yanlış sürücüye
// düşerdi. Bu yüzden her değer trim'lenerek okunuyor.
const read = (key) => String(process.env[key] ?? '').trim()

const isProduction = read('NODE_ENV') === 'production'

// knex'in MySQL/MariaDB sürücüsü `mysql2`. Yaygın yazımları da kabul ediyoruz
// ki .env'ye "mysql" ya da "mariadb" yazılmış olması SQLite'a düşürmesin.
const MYSQL_ALIASES = new Set(['mysql', 'mysql2', 'mariadb'])
const rawClient = read('DB_CLIENT')
const useMysql = MYSQL_ALIASES.has(rawClient.toLowerCase())

// Yapılandırma hatasında süreci burada durduruyoruz. Aksi halde uygulama
// sorunsuz açılır, hata ancak ilk veritabanı isteğinde "Sunucu hatası." olarak
// görünür ve gerçek sebep log'un içinde kaybolur.
// index.js'teki JWT_SECRET kontrolüyle aynı yaklaşım.
function fail(baslik, detay) {
  console.error(`\nVERITABANI YAPILANDIRMA HATASI: ${baslik}\n\n${detay}\n`)
  process.exit(1)
}

if (isProduction) {
  if (!rawClient) {
    fail(
      'DB_CLIENT tanimli degil',
      'server/.env icinde DB_CLIENT satiri yok ya da basinda # var.\n' +
        'MySQL/MariaDB icin o satirin basindaki # isaretini kaldirin:\n\n' +
        '  DB_CLIENT=mysql2\n\n' +
        "Bu deger olmadan uygulama SQLite'a duserdi; uretimde buna izin verilmiyor."
    )
  }
  if (!useMysql) {
    fail(
      `DB_CLIENT degeri taninmiyor: "${rawClient}"`,
      'Uretimde gecerli deger: mysql2\n' +
        '(mysql ve mariadb yazimlari da kabul edilir; hepsi mysql2 surucusunu kullanir.)'
    )
  }
  const eksik = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter((key) => !read(key))
  if (eksik.length) {
    fail(
      `Veritabani bilgileri eksik: ${eksik.join(', ')}`,
      'server/.env icinde bu satirlarin karsisi bos.\n' +
        'aaPanel -> Databases bolumundeki bilgilerle doldurun.'
    )
  }
}

const sqlite = {
  client: 'better-sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: read('SQLITE_FILE') || './data/dev.sqlite3',
  },
  migrations: { directory: './src/migrations' },
  seeds: { directory: './src/seeds' },
}

const mysql = {
  client: 'mysql2',
  connection: {
    host: read('DB_HOST'),
    port: Number(read('DB_PORT')) || 3306,
    user: read('DB_USER'),
    // Sifre bilerek trim'lenmiyor: bastaki/sondaki bosluk gecerli olabilir.
    password: process.env.DB_PASSWORD ?? '',
    database: read('DB_NAME'),
    charset: 'utf8mb4',
    // DATE/TIMESTAMP sutunlarini JS Date yerine "YYYY-MM-DD" string olarak dondurur.
    // Aksi halde admin panelindeki <input type="date"> alani bos gelir.
    dateStrings: true,
  },
  pool: { min: 0, max: 10 },
  acquireConnectionTimeout: 30000,
  migrations: { directory: './src/migrations' },
  seeds: { directory: './src/seeds' },
}

const config = useMysql ? mysql : sqlite

module.exports = {
  development: config,
  production: config,
}
