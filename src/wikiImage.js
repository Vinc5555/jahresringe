// ─────────────────────────────────────────────────────────────
// wikiImage.js – BILDER AUTOMATISCH AUS WIKIPEDIA HOLEN
// Für jeden Eintrag mit einem de.wikipedia-Link sucht die App ein Bild:
//   1. das offizielle Titelbild des Artikels
//   2. sonst das erste passende Foto weiter unten im Artikel
//      (ohne Logos, Karten, Flaggen, Wappen, Icons …)
// Die deutsche Wikipedia erlaubt nur frei lizenzierte Bilder.
// Urheber und Lizenz werden mitgeladen und unter der Karte angezeigt.
// Ergebnisse werden gemerkt (Cache), damit nichts doppelt geladen wird.
// ─────────────────────────────────────────────────────────────
import { config } from './config.js'

const API = 'https://de.wikipedia.org/w/api.php'
const cache = new Map() // Artikel-URL → Promise<{ url, credit } | null>

// Dateinamen, die fast nie ein schönes Foto sind
const SKIP = /logo|icon|flag|flagge|wappen|coat.of.arms|karte|map|locator|lage|signatur|signature|unterschrift|symbol|emblem|banner|commons|wiki|portal|button|piktogramm|pictogram|stub|disambig|edit|question/i

// Mindestgröße und erlaubte Seitenverhältnisse für Fotos aus dem Artikel
const MIN_WIDTH = 300
const MIN_HEIGHT = 200
const isPhotoShaped = (w, h) => w >= MIN_WIDTH && h >= MIN_HEIGHT && w / h > 0.5 && w / h < 3

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php'

// Bild-URL für einen Wikimedia-Commons-Dateinamen (Feld "image" in events.json)
export function commonsUrl(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${config.imageWidth}`
}

// Fest eingetragenes Commons-Bild + Urheber/Lizenz → Promise<{ url, credit }>
// Klappt die Abfrage nicht, wird das Bild trotzdem angezeigt (ohne Urheberzeile).
export function commonsImage(file) {
  const key = `commons:${file}`
  if (!cache.has(key)) {
    const fallback = { url: commonsUrl(file), credit: '' }
    cache.set(key, fileInfos([file], COMMONS_API)
      .then((infos) => {
        const info = infos.get(normalize(file))
        return info ? { url: info.thumburl || info.url, credit: creditFrom(info) } : fallback
      })
      .catch(() => fallback))
  }
  return cache.get(key)
}

// Bild für einen de.wikipedia-Artikel finden → Promise<{ url, credit } | null>
export function wikiImage(articleUrl) {
  const match = articleUrl?.match(/^https:\/\/de\.wikipedia\.org\/wiki\/([^#?]+)/)
  if (!match) return Promise.resolve(null)
  const title = decodeURIComponent(match[1]).replace(/_/g, ' ')
  // Datums- oder Jahresseiten ("17. November", "1959") haben nur zufällige Bilder
  if (/^\d+\. [A-ZÄÖÜ][a-zä]+$|^\d{1,4}$/.test(title)) return Promise.resolve(null)
  if (!cache.has(articleUrl)) {
    const promise = findImage(title).catch(() => {
      cache.delete(articleUrl) // Fehler nicht merken → beim nächsten Mal neu versuchen
      return null // offline/blockiert → Ersatzgrafik
    })
    cache.set(articleUrl, promise)
  }
  return cache.get(articleUrl)
}

async function findImage(title) {
  // Titelbild + alle Bilder des Artikels (in Reihenfolge) parallel abfragen
  const [lead, inArticle] = await Promise.all([leadImage(title), articleImages(title)])

  // Kandidaten: Titelbild zuerst, dann Fotos aus dem Artikel.
  // Nur JPG/PNG (SVG sind fast immer Logos/Grafiken), keine Logos/Karten/Flaggen …
  const usable = (f) => f && /\.(jpe?g|png)$/i.test(f) && !SKIP.test(f)
  const candidates = [lead, ...inArticle.filter((f) => f !== lead)].filter(usable).slice(0, 12)
  if (!candidates.length) return null

  const infos = await fileInfos(candidates)
  for (const name of candidates) {
    const info = infos.get(normalize(name))
    if (!info) continue
    // Das Titelbild hat Wikipedia selbst ausgewählt → immer nehmen.
    // Fotos aus dem Artikel müssen eine sinnvolle Größe/Form haben.
    if (name === lead || isPhotoShaped(info.width, info.height)) {
      return { url: info.thumburl || info.url, credit: creditFrom(info) }
    }
  }
  return null
}

// Warteschlange: höchstens MAX_PARALLEL Anfragen gleichzeitig,
// sonst bremst Wikipedia die App aus (Fehler 429 "zu viele Anfragen").
const MAX_PARALLEL = 2
let running = 0
const waiting = []
async function limited(task) {
  if (running >= MAX_PARALLEL) await new Promise((resolve) => waiting.push(resolve))
  running++
  try {
    return await task()
  } finally {
    running--
    waiting.shift()?.()
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Kleiner Helfer für Anfragen an die Wikipedia-Schnittstelle
function api(params, base = API) {
  const query = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', redirects: '1', ...params })
  return limited(async () => {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`${base}?${query}`)
      if (res.ok) return res.json()
      // Gebremst → kurz warten und nochmal (max. 3 Versuche)
      if (res.status === 429 && attempt < 2) await sleep(1500 * (attempt + 1))
      else throw new Error(`Wikipedia-API: ${res.status}`)
    }
  })
}

// Offizielles Titelbild (Dateiname ohne "Datei:")
async function leadImage(title) {
  const data = await api({ action: 'query', prop: 'pageimages', piprop: 'name', titles: title })
  return data.query?.pages?.[0]?.pageimage?.replace(/_/g, ' ') || null
}

// Alle im Artikel verwendeten Bilder, in der Reihenfolge ihres Auftretens
async function articleImages(title) {
  const data = await api({ action: 'parse', page: title, prop: 'images' })
  return (data.parse?.images || []).map((f) => f.replace(/_/g, ' '))
}

// Größe, Vorschau-URL, Urheber und Lizenz für mehrere Dateien auf einmal
async function fileInfos(names, base = API) {
  const data = await api({
    action: 'query',
    prop: 'imageinfo',
    titles: names.map((n) => `Datei:${n}`).join('|'),
    iiprop: 'url|size|extmetadata',
    iiurlwidth: String(config.imageWidth),
    iiextmetadatafilter: 'Artist|LicenseShortName',
  }, base)
  const map = new Map()
  for (const page of data.query?.pages || []) {
    if (page.imageinfo?.[0]) map.set(normalize(page.title.replace(/^[^:]+:/, '')), page.imageinfo[0])
  }
  return map
}

// Dateinamen vergleichbar machen (Unterstriche, erster Buchstabe)
function normalize(name) {
  const n = name.replace(/_/g, ' ').trim()
  return n.charAt(0).toUpperCase() + n.slice(1)
}

// "Fotograf · CC BY-SA 4.0 · Wikimedia Commons"
function creditFrom(info) {
  const meta = info.extmetadata || {}
  const artist = stripHtml(meta.Artist?.value)
  const license = meta.LicenseShortName?.value
  return [artist, license, 'Wikimedia Commons'].filter(Boolean).join(' · ')
}

function stripHtml(html) {
  if (!html) return ''
  // DOMParser führt nichts aus (sicherer als innerHTML)
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent || ''
  return text.replace(/\s+/g, ' ').trim().slice(0, 80)
}
