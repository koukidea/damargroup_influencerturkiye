// Influencer kartlarındaki görsellerin responsive (srcset) varyantlarını üretir.
// Kaynak: public/assets/webp/*.webp  ->  public/assets/webp/responsive/<ad>-<genişlik>w.webp
// Ayrıca src/data/imageVariants.json manifestini yazar; <img srcset> bu manifestten kurulur.
//
// Çalıştırma: npm run images
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(root, 'public/assets/webp')
const outputDir = path.join(sourceDir, 'responsive')
const manifestPath = path.join(root, 'src/data/imageVariants.json')

// Kartın CSS kutusu 3:4 (aspect-[3/4]) — varyantları da 3:4 kırparak object-cover'ın
// tarayıcı tarafında yaptığı kırpmayı build zamanına alıyoruz.
const WIDTHS = [300, 450, 600, 900]
const ASPECT = 4 / 3
const QUALITY = 78

async function main() {
  await mkdir(outputDir, { recursive: true })

  const files = (await readdir(sourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.webp'))
    .map((entry) => entry.name)
    .sort()

  const manifest = {}

  for (const file of files) {
    const base = file.replace(/\.webp$/, '')
    const source = path.join(sourceDir, file)
    const { width: sourceWidth } = await sharp(source).metadata()

    // Kaynaktan büyük varyant üretmek anlamsız — sadece kaynağa sığan genişlikler.
    const widths = WIDTHS.filter((width) => width <= sourceWidth)
    if (widths.length === 0) widths.push(sourceWidth)

    for (const width of widths) {
      const target = path.join(outputDir, `${base}-${width}w.webp`)
      await sharp(source)
        .resize(width, Math.round(width * ASPECT), { fit: 'cover', position: 'centre' })
        .webp({ quality: QUALITY })
        .toFile(target)
    }

    manifest[`/assets/webp/${file}`] = widths
    console.log(`${file} -> ${widths.join('w, ')}w`)
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(`\n${files.length} görsel, manifest: ${path.relative(root, manifestPath)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
