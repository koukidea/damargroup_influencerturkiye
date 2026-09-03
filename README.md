# Influencer Türkiye — Kurulum ve Yayınlama Rehberi

Bu paket iki ayrı Node.js projesinden oluşur:

- **`influencer-turkiye/`** — React + Vite frontend (site)
- **`influencer-turkiye/server/`** — Express + Knex API (backend, veritabanı)

`node_modules/` klasörleri ve `.env` dosyaları pakete **dahil edilmedi** —
bunlar makineye özgüdür ve aşağıdaki adımlarla yeniden oluşturulur.

---

## 1. Gereksinimler

- **Node.js 22 veya üzeri** (`node -v` ile kontrol edin)

  > Node 18 veya 20 **yetmez**: `better-sqlite3@13` Node ≥ 22, `vite@8` ve
  > `react-router@7` ise Node ≥ 20 istiyor. Node 22 LTS önerilir.

- npm (Node.js ile birlikte gelir)
- Canlı sunucuda: MySQL 5.7+ / **MariaDB 10.4+** (test edilen: MariaDB 10.11)

---

## 2. Yerelde çalıştırma (geliştirme)

Yerelde veritabanı kurmanıza gerek yok — `DB_CLIENT` boş bırakılırsa dosya
tabanlı SQLite kullanılır.

```bash
# Backend
cd influencer-turkiye/server
npm install
cp .env.example .env          # .env içinde JWT_SECRET'i değiştirin
npm run migrate
npm run seed                   # kategoriler + başlangıç yazıları dahil
npm run start                  # http://127.0.0.1:4000

# Frontend (yeni bir terminalde)
cd influencer-turkiye
npm install
npm run dev                    # http://localhost:5173
```

Seed komutu şu demo yönetici hesabını oluşturur:

- **E-posta:** `admin@influencerturkiye.com`
- **Şifre:** `admin123`

> Canlıya almadan önce bu şifreyi mutlaka değiştirin.

Geliştirme sırasında dosya değişikliklerinde otomatik yeniden başlatma için
`npm run dev` (nodemon) kullanabilirsiniz.

---

## 3. Ortam değişkenleri

### `server/.env`

| Değişken | Açıklama |
|---|---|
| `PORT` | API portu (varsayılan 4000) |
| `HOST` | Dinlenecek adres. Reverse proxy arkasında **`127.0.0.1`** bırakın; portun dışarı açılmasını engeller. |
| `NODE_ENV` | Canlıda `production`. |
| `JWT_SECRET` | **Zorunlu.** `production` modunda boşsa veya `change-me` ise API başlamayı reddeder. |
| `CORS_ORIGIN` | API'nin izin verdiği site adresleri (virgülle ayrılır). Site ile API aynı alan adındaysa devreye girmez. |
| `SITE_URL` | Sitemap'teki mutlak adreslerin kökü. Boş bırakılırsa isteğin geldiği alan adı kullanılır. |
| `TRUST_PROXY` | Güvenilen proxy sayısı (varsayılan 1). Cloudflare gibi ikinci bir katman varsa 2 yapın. |
| `RATE_LIMIT_DISABLED` | `true` yapılırsa hız sınırı kapanır. Yalnızca acil durum için — aşağıya bakın. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Form bildirimlerini gönderen SMTP kutusu. `SMTP_HOST` boşsa mail gönderimi kapalıdır (başvurular yine veritabanına yazılır). |
| `SMTP_SECURE` | `true`/`false`. Boş bırakılırsa porta göre belirlenir (465 → TLS, 587 → STARTTLS). |
| `MAIL_FROM` | Gönderen adresi. Boş bırakılırsa `SMTP_USER` kullanılır. |
| `MAIL_TO_BRAND` / `MAIL_TO_INFLUENCER` / `MAIL_TO_CONTACT` | Bildirimin düşeceği kutular. Varsayılanlar: `customer@`, `influencer@`, `hello@influencerturkiye.com`. |
| `DB_CLIENT` | `mysql2` yazılırsa MySQL/MariaDB, boş bırakılırsa SQLite kullanılır. |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL bağlantı bilgileri. |
| `SQLITE_FILE` | Yalnızca SQLite modunda kullanılır. |

Rastgele bir `JWT_SECRET` üretmek için:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Not:** Veritabanı seçimi `NODE_ENV`'e **bağlı değildir**, yalnızca
> `DB_CLIENT` değerine bakar. `DB_CLIENT=mysql2` yazmanız yeterlidir.

### Frontend

API adresi build anında koda gömülür. Depoda hazır olan `.env.production`
dosyası şunu içerir:

```
VITE_API_URL=/api
```

Bu göreli yol, sitenin ve API'nin **aynı alan adı** üzerinden servis
edilmesini varsayar (aşağıdaki önerilen kurulum). Bu sayede alan adı
değişse bile yeniden build almanız gerekmez.

API'yi ayrı bir alt alan adında çalıştıracaksanız bu dosyayı tam adresle
değiştirin (`VITE_API_URL=https://api.alan-adiniz.com/api`) ve `server/.env`
içindeki `CORS_ORIGIN` değerini site adresiyle **birebir** eşleştirin —
aksi halde tarayıcı bağlantıyı engeller ve site boş görünür.

---

## 4. Veritabanını MySQL / MariaDB'ye alma

**1)** Veritabanını **utf8mb4** ile oluşturun. Bu şart — `utf8` (utf8mb3)
veya `latin1` seçilirse migration, emoji içeren varsayılan değerde
`Incorrect string value` hatasıyla durur ve Türkçe karakterler bozulur.

```sql
CREATE DATABASE db_adi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

aaPanel'de: **Databases → Add DB**, charset olarak `utf8mb4` seçin.

**2)** `server/.env` içindeki veritabanı satırlarını doldurun:

```
DB_CLIENT=mysql2
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=veritabani_kullanicisi
DB_PASSWORD=sifre
DB_NAME=veritabani_adi
```

**3)** Şemayı ve örnek verileri kurun:

```bash
cd influencer-turkiye/server
npm run migrate
npm run seed
```

Kod tarafında hiçbir değişiklik gerekmez.

---

## 5. Canlıya alma (aaPanel)

Önerilen yapı: **tek alan adı + `/api` reverse proxy**. Ayrı bir `api.`
alt alan adı açmanıza gerek yok; bu yapıda CORS tamamen devre dışı kalır
ve tek SSL sertifikası yeterlidir.

```
influencerturkiye.com/          →  dist/ (statik dosyalar, Nginx)
influencerturkiye.com/api/...   →  proxy_pass 127.0.0.1:4000 (Node)
```

### 5.1 API'yi ayağa kaldırma

**aaPanel → Node Project → Add:**

- Proje klasörü: `.../server`
- Başlangıç komutu: `npm run start`
- Node sürümü: **22**
- Port: `4000`
- Alan adı istenirse **kullanılmayan bir alt alan adı** verin (örn.
  `node.influencerturkiye.com`; DNS kaydı gerekmez). Ana alan adını
  **bağlamayın** — bağlarsanız tüm trafik Node'a gider ve statik site
  servis edilemez.

Ardından:

```bash
cd /www/wwwroot/.../server
npm install --omit=dev
npm run migrate
npm run seed
```

pm2 tercih ederseniz:

```bash
npm install -g pm2
pm2 start src/index.js --name influencer-turkiye-api
pm2 save
```

> `better-sqlite3` yalnızca SQLite modunda yüklenir. MySQL kullanırken
> derlenmesi başarısız olsa bile uygulama sorunsuz çalışır.

### 5.2 Siteyi yayınlama

```bash
cd influencer-turkiye
npm install
npm run build
```

`dist/` klasörünün **içindeki tüm dosyaları** (klasörün kendisini değil)
sitenin kök dizinine yükleyin. Node.js'in bu tarafta çalışmasına gerek
yoktur, düz statik dosyalardır.

**aaPanel → Website → Add site** (PHP: *Static / pure static*), sonra site
ayarlarından **Reverse proxy** ekleyin:

- Proxy dizini: `/api`
- Hedef URL: `http://127.0.0.1:4000`

### 5.3 SPA yönlendirmesi — Nginx kullanıyorsanız zorunlu

React Router adresleri (`/kaynaklar/xyz` gibi) sayfa yenilendiğinde 404
vermesin diye sunucunun bilinmeyen yolları `index.html`'e düşürmesi gerekir.

- **Apache:** `dist/.htaccess` bunu zaten yapar, ek işlem gerekmez.
- **Nginx (aaPanel varsayılanı):** `.htaccess` **yok sayılır.** Site
  yapılandırma dosyasındaki `server { }` bloğuna şunu ekleyin:

  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```

  Nginx en uzun prefix'i seçtiği için `/api` reverse proxy'si bundan
  etkilenmez.

### 5.3.1 Eski giriş dosyaları — `/index.html` → `/` (301)

Statik site alışkanlığından kalan `/index.html`, `/index.htm`, `/index.php`
adresleri gerçek bir sayfa değil. Uygulama içinde bunlar ana sayfaya
yönlendiriliyor (`src/App.jsx`), ama arama motoru açısından temiz olması
için yönlendirmeyi sunucuda **301** olarak vermek gerekir. `server { }`
bloğuna ekleyin:

```nginx
# Eski giriş dosyalarını ana sayfaya taşı.
# Koşul $request_uri üzerinden kurulu: bu değişken isteğin ORİJİNAL halini
# tutar ve internal redirect'lerde değişmez.
if ($request_uri ~ "^/index\.(html?|php)(\?|$)") {
    return 301 /;
}
```

> **`location = /index.html { return 301 /; }` YAZMAYIN.** SPA fallback'i
> olan `try_files $uri $uri/ /index.html` son parametreye *internal
> redirect* yapar; internal redirect ise location eşleştirmesini baştan
> çalıştırır. Bu yüzden `/portfolyo` isteği bile `/index.html` location'ına
> düşer, 301 alır, `/` adresi tekrar `index.html`e çözülür ve döngü kapanmaz
> — tek bir adres değil **tüm site** `ERR_TOO_MANY_REDIRECTS` verir.
> `$request_uri` koşulu bu tuzağı tamamen atlatır.

Doğrulama (yeniden yükleme sonrası):

```bash
curl -sI https://alan-adiniz.com/index.html | head -2   # 301 + Location: /
curl -so /dev/null -w '%{http_code}\n' https://alan-adiniz.com/portfolyo   # 200
```

İkinci komut şart: döngü hatası yalnızca fallback'e düşen bir adreste
görünür, `/index.html` tek başına yanıltıcıdır.

**robots.txt — ek yapılandırma gerekmez.** Tarayıcılar bu dosyayı yalnızca
alan adının kökünden okur; `public/robots.txt` build sırasında `dist/`
köküne kopyalandığı için `https://alan-adiniz.com/robots.txt` doğrudan
çalışır. SPA fallback yalnızca **var olmayan** dosyalarda devreye girer,
gerçek bir dosya olduğu için ona dokunmaz.

Tek yapmanız gereken, alan adınız farklıysa `public/robots.txt` içindeki
son satırı güncelleyip yeniden build almak:

```
Sitemap: https://alan-adiniz.com/api/sitemap.xml
```

İsterseniz robots.txt'i statik dosya yerine API'den (alan adını kendi
bulan sürüm) sunabilirsiniz — bu durumda `public/robots.txt` dosyasını
silin ve Nginx'e ekleyin:

```nginx
location = /robots.txt {
    proxy_pass http://127.0.0.1:4000/api/robots.txt;
}
```

Sitemap'i `/api/sitemap.xml` yerine kökten sunmak isterseniz:

```nginx
location = /sitemap.xml {
    proxy_pass http://127.0.0.1:4000/api/sitemap.xml;
}
```

Bu kuralı eklerseniz `public/robots.txt` içindeki `Sitemap:` satırını da
`https://alan-adiniz.com/sitemap.xml` yapın.

Doğrulama:

```bash
curl https://alan-adiniz.com/robots.txt
```

Düz metin dönmeli — HTML dönüyorsa dosya `dist/` köküne çıkmamış demektir.

### 5.4 Hız sınırı (rate limit)

API, kaba kuvvet saldırılarına ve bot spam'ine karşı IP başına sınırlıdır:

| Uç | Sınır | Not |
|---|---|---|
| `POST /api/auth/login` | 15 dakikada 10 **başarısız** deneme | Başarılı girişler sayılmaz; şifresini doğru giren kullanıcı kilitlenmez. |
| `POST /api/auth/register` | Saatte 10 kayıt | |
| `POST /api/applications` | Saatte 10 başvuru | Form herkese açık olduğu için en dar limit burada. |
| Diğer tüm `/api` istekleri | 15 dakikada 600 | Bir sayfa açılışı ~4 istek; normal kullanımı etkilemez. |
| `GET /api/health` | sınırsız | İzleme araçları engellenmesin diye muaf. |

Sınıra takılan istek `429` ve `{ "error": "..." }` döner; site bu mesajı
kullanıcıya olduğu gibi gösterir.

**Kurulumdan sonra mutlaka doğrulayın:**

```bash
curl https://alan-adiniz.com/api/health
```

Dönen `ip` alanı **kendi genel IP adresinizi** göstermelidir. `127.0.0.1`
görüyorsanız Nginx gerçek istemci IP'sini iletmiyordur; bu durumda tüm
ziyaretçiler tek bir sayaçta toplanır ve site kısa sürede herkese `429`
vermeye başlar. Çözüm: reverse proxy yapılandırmasına

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

satırlarını ekleyin (aaPanel bunları genelde otomatik ekler). Acil durumda
geçici çözüm olarak `.env` içinde `RATE_LIMIT_DISABLED=true` yapıp API'yi
yeniden başlatabilirsiniz.

> Hız sınırı sayaçları bellekte tutulur. API'yi pm2 **cluster** modunda
> birden fazla süreçle çalıştırırsanız her süreç kendi sayacını tutar;
> tek süreç (fork modu / aaPanel Node Project varsayılanı) önerilir.

### 5.5 Yayın öncesi kontrol listesi

- [ ] `JWT_SECRET` rastgele bir değerle değiştirildi
- [ ] Admin şifresi (`admin123`) değiştirildi
- [ ] Veritabanı `utf8mb4` ile oluşturuldu
- [ ] `server/.env` içinde `NODE_ENV=production` ve `HOST=127.0.0.1`
- [ ] SSL kuruldu ve "Force HTTPS" açıldı
- [ ] `dist/` yeniden build alındı (API adresi build anında gömülür)
- [ ] `/kaynaklar/...` gibi bir adres yenilendiğinde 404 vermiyor
- [ ] `https://alan-adiniz.com/robots.txt` düz metin dönüyor (HTML değil)
- [ ] `https://alan-adiniz.com/api/health` yanıtı `{"ok":true,"ip":"<kendi genel IP'niz>"}` — `ip` alanı `127.0.0.1` **olmamalı**
- [ ] `server/.env` içinde SMTP bilgileri dolduruldu ve üç formdan birer test başvurusu gönderilip mailler ilgili kutulara düştü

---

## 6. Blog (Kaynaklar) ve SEO

### 6.1 Adres yapısı

| Adres | İçerik |
|---|---|
| `/kaynaklar` | Yazı listesi. Kategori, arama ve sayfalama adres çubuğuna yansır (`?kategori=…&ara=…&sayfa=2`), böylece filtreli görünümler paylaşılabilir. |
| `/yazi-basligi` | Yazı detayı — **kök seviyede**, slug yazı başlığından üretilir. |
| `/kaynaklar/yazi-basligi` | Eski adres. Kalıcı olarak yeni kök adrese yönlendirilir; paylaşılmış bağlantılar kırılmaz. |

Slug, başlıktaki Türkçe karakterler sadeleştirilerek oluşturulur
(`Markanız İçin Doğru Influencer'ı Seçmenin 6 Kriteri` →
`markaniz-icin-dogru-influenceri-secmenin-6-kriteri`) ve **başlık
değişmedikçe sabit kalır**; yazıyı her kaydettiğinizde adres değişmez.

> Yazılar kök adreste durduğu için bir yazı slug'ı site sayfalarından biriyle
> (`iletisim`, `hizmetlerimiz`, `admin`, `api` …) çakışamaz. Sunucu bu adları
> rezerve tutar ve çakışma olursa sonuna `-2` ekler
> (`server/src/lib/slugify.js`).

### 6.2 Arama motorlarına bildirme

Sitemap veritabanından **canlı olarak** üretilir — yeni yazı eklediğinizde
elle güncelleme gerekmez:

```
https://alan-adiniz.com/api/sitemap.xml
```

`public/robots.txt` bu adresi işaret eder. **Alan adınız farklıysa** o
dosyanın son satırındaki `Sitemap:` adresini güncelleyip yeniden build alın.

`server/.env` içindeki `SITE_URL` sitemap'teki mutlak adresleri belirler.
Boş bırakılırsa isteğin geldiği alan adı kullanılır; reverse proxy arkasında
bu genelde doğru sonucu verir.

**Google Search Console'a ekleyin:** Site ekle → Sitemaps →
`api/sitemap.xml` yazıp gönderin.

### 6.3 Sayfa başlıkları ve paylaşım görselleri

Her sayfa kendi `<title>`, açıklama, canonical ve Open Graph etiketlerini
`src/lib/seo.js` üzerinden yazar. Yazı sayfaları ayrıca `BlogPosting` ve
`BreadcrumbList` yapısal verisi (JSON-LD) üretir — Google sonuçlarında
tarih, yazar ve "Anasayfa › Kaynaklar › Yazı" kırıntısı görünür.

Admin panelinde her yazı için **SEO Başlığı** ve **SEO Açıklaması**
alanları vardır (Gelişmiş SEO ayarları). Boş bırakılırsa yazının kendi
başlığı ve özeti kullanılır.

### 6.4 Yazı biçimlendirme

İçerik alanı sade bir markdown alt kümesi kabul eder. Ham HTML
çalıştırılmaz — bu yüzden içerik üzerinden XSS mümkün değildir.

| Yazım | Sonuç |
|---|---|
| `## Başlık` / `### Alt başlık` | Bölüm başlıkları |
| `**kalın**` · `*eğik*` · `` `kod` `` | Satır içi biçimlendirme |
| `[metin](https://adres)` | Bağlantı (dış bağlantılar yeni sekmede açılır) |
| `- madde` / `1. madde` | Madde ve numaralı liste |
| `> alıntı` | Alıntı bloğu |
| `![açıklama](/gorsel.webp)` | Görsel |
| `---` | Ayraç çizgisi |

Formun üstündeki **Önizle** düğmesi yazının sitedeki halini gösterir.

### 6.5 Taslak / yayında

Yeni yazılar varsayılan olarak **Yayında** kaydedilir. **Taslak** seçilen
yazılar listede, sitemap'te ve arama sonuçlarında görünmez; adresi doğrudan
açılırsa yalnızca giriş yapmış yöneticiye gösterilir.

### 6.6 Kategori yapısı

Kaynaklar altı kategoriye ayrılmıştır; her biri farklı bir arama amacına
hizmet eder:

| Kategori | Ne için | Örnek |
|---|---|---|
| **Rehberler** | Kalıcı başvuru içerikleri — SEO omurgası | Influencer Marketing Nedir? |
| **İçgörüler** | Sektörel analiz, uzman görüşü | Influencer Seçiminde 5 Pahalı Hata |
| **Araştırmalar & Raporlar** | Veri odaklı içerikler | Türkiye Influencer Marketing Raporu |
| **Başarı Hikayeleri** | Gerçek kampanya sonuçları | Kozmetik markası vaka analizi |
| **Trendler** | Güncel, hızlı tüketilen içerik | TikTok influencer trendleri |
| **Influencer Marketing Sözlüğü** | Uzun kuyruk arama trafiği | UGC nedir?, CPM nedir? |

Bu yapı header'daki **Kaynaklar** menüsüne gelindiğinde açılan listede ve
`/kaynaklar` sayfasındaki filtre çubuğunda görünür. Menüdeki açıklama
metni kategorinin `description` alanından gelir.

`/admin/kaynak-kategorileri` sayfasından kategori eklenir; adı, açıklaması,
ikonu ve rengi değiştirilir. Kategori adresi (slug) ilk oluşturmada
belirlenir ve sonradan değişmez — yazıların bağı ve filtre adresleri buna
dayanır. İçinde yazı bulunan bir kategori silinemez; önce yazıları
taşımanız istenir.

### 6.7 Başlangıç içeriğini kurma

Kategoriler ve başlangıç yazıları `server/src/data/` altında durur
(`blogCategories.js`, `blogPosts.js`). İki şekilde uygulanır:

**Yeni kurulumda** — `npm run seed` zaten bu yapıyı kurar.

**Mevcut veritabanında** — hiçbir veriyi silmeden ekler:

```bash
cd server && npm run blog:import
```

Bu komut tekrar tekrar çalıştırılabilir: kategori varsa günceller, yoksa
ekler; yazı slug'ı zaten varsa **atlar** (elle yaptığınız düzenlemeler
korunur); eski kategorilerdeki yazıları yeni yapıya taşır ve boşalan eski
kategorileri siler.

> Komuttan önce `npm run migrate` çalıştırmayı unutmayın — kategori
> açıklaması yeni bir sütun.

### 6.8 Vaka analizinde marka adı

"Vaka Analizi: Kozmetik Markasında Dönüşüm Artışı" yazısında marka adı
anonim tutulmuştur ("orta ölçekli bir Türk cilt bakım markası"). Marka adını
yazmak isterseniz önce markadan **yazılı onay** alın; müşteri adı ve kampanya
sonucu paylaşımı çoğu ajans sözleşmesinde izne tabidir.

---

## 7. Bilinen Sınırlamalar

- **Görsel dönüştürme (`sharp`) sunucuda yüklenemeyebilir.** API açılışında
  `UYARI: sharp yüklenemedi` görürseniz site yine çalışır; panelden yüklenen
  görseller yalnızca WebP'ye çevrilmeden ve küçültülmeden, geldiği biçimde
  kaydedilir (HEIC bu durumda kabul edilmez). Sebep genelde sunucunun `glibc`
  sürümünün hazır derlenmiş ikili için eski olmasıdır. Teşhis:

  ```bash
  ldd --version | head -1
  cd server && node -e "try{require('@img/sharp-linux-x64/lib/sharp-linux-x64.node')}catch(e){console.log(e.message)}"
  ```

  glibc 2.26'dan eskiyse `sharp` daha eski bir sürüme sabitlenmeli
  (`npm install sharp@0.32.6` — glibc 2.17 ile çalışır). İkili dosya hiç
  yoksa `npm install --include=optional sharp` ile yeniden kurun.
- **Yüklenen görseller `server/uploads/` klasöründe tutulur.** Panelden
  yüklenen influencer fotoğrafları ve kapak görselleri build'e (`dist/`) değil
  API'nin yanına yazılır ve `/api/uploads/...` adresinden servis edilir. Yeni
  sürüm yüklemek bu dosyaları silmez, ama sunucu yedeğine bu klasörü de dahil
  edin. Farklı bir konum için `.env` dosyasına `UPLOAD_DIR` yazın.
- **KVKK sayfası boş.** Başvuru formları ad, e-posta, telefon gibi kişisel
  veri topluyor; yayına almadan önce aydınlatma metni ve açık rıza onay
  kutusu eklenmelidir.
- **Güvenlik başlıkları eksik.** `helmet` ve içerik güvenlik politikası (CSP)
  henüz eklenmedi.
- **Yumuşak 404.** Site statik dosya olarak servis edildiği için var olmayan
  bir adres HTTP 200 döner, sayfa içinde 404 gösterilir. Bu sayfalara
  `noindex` etiketi konduğu için arama sonuçlarına girmezler; gerçek bir 404
  kodu istenirse sunucu tarafında (Nginx/Node) render gerekir.
