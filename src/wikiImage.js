// ─────────────────────────────────────────────────────────────
// wikiImage.js – BILDER AUTOMATISCH AUS WIKIPEDIA HOLEN
// Für jeden Eintrag mit einem de.wikipedia-Link fragt die App die
// Wikipedia-Schnittstelle nach dem Titelbild des Artikels.
// Ergebnis wird gemerkt (Cache), damit nichts doppelt geladen wird.
// ─────────────────────────────────────────────────────────────
import { config } from './config.js'

const cache = new Map() // Artikel-URL → Bild-URL (oder null)

// Bild-URL für einen Wikimedia-Commons-Dateinamen (Feld "image" in events.json)
export function commonsUrl(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${config.imageWidth}`
}

// Titelbild eines de.wikipedia-Artikels holen → Promise<string|null>
export async function wikiImage(articleUrl) {
  const match = articleUrl?.match(/^https:\/\/de\.wikipedia\.org\/wiki\/(.+)$/)
  if (!match) return null
  if (cache.has(articleUrl)) return cache.get(articleUrl)

  const promise = fetch(`https://de.wikipedia.org/api/rest_v1/page/summary/${match[1]}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const thumb = data?.thumbnail?.source
      if (!thumb) return null
      // Vorschaubild in der gewünschten Breite anfordern (z. B. 320px → 600px)
      return thumb.replace(/\/\d+px-/, `/${config.imageWidth}px-`)
    })
    .catch(() => null) // offline oder blockiert → Ersatzgrafik

  cache.set(articleUrl, promise)
  return promise
}
