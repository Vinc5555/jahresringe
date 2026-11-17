<!--
  YearCard.vue – EINE JAHRESKARTE
  Zwei Darstellungen, je nach Anzahl der Einträge:
  - 1 Eintrag (Tagesereignis): großes Bild + Titel + Text
  - 3–5 Einträge (Meilensteine/Geburtstage): kleineres Bild + kompakte Liste
  Das Bild läuft nach unten weich in den Hintergrund aus (Blur + Verlauf).
-->
<script setup>
import { computed, ref, watchEffect } from 'vue'
import { entryImage } from '../wikiImage.js'

const props = defineProps({
  entry: Object,   // { year, type, items: [...] } aus events.json
  first: Boolean,  // erste Karte → Wisch-Hinweis zeigen
})

// Label oben je nach Typ – hier Texte anpassen
const LABELS = {
  day: { icon: '⭐', text: 'An diesem Tag' },
  year: { icon: '🌍', text: 'In diesem Jahr' },
  birthday: { icon: '🎂', text: 'Auch Geburtstag' },
}
const label = computed(() => LABELS[props.entry.type] || LABELS.year)
const single = computed(() => props.entry.items.length === 1)

const hero = ref(null)        // Eintrag, dessen Bild angezeigt wird
const imageUrl = ref(null)
const imageCredit = ref('')   // Urheber · Lizenz (automatisch von Wikimedia)
const imageOwn = ref(false)   // eigenes Bild aus public/bilder/?
const imageFailed = ref(false) // Bild nicht ladbar → Ersatzgrafik
// Logos/Grafiken (SVG) ganz zeigen statt bildschirmfüllend zuschneiden
const isLogo = computed(() => /\.svg$/i.test(hero.value?.image || ''))

// Bild für diese Karte holen (Logik + Cache in wikiImage.js;
// die ersten Jahre sind dort meist schon vom Startscreen vorgeladen)
watchEffect(async () => {
  const found = await entryImage(props.entry)
  hero.value = found?.item || null
  imageUrl.value = found?.url || null
  imageCredit.value = found?.credit || ''
  imageOwn.value = !!found?.own
})

// Bildnachweis unter dem Text:
//   1 Eintrag:   "Bild: <credit>"
//   mehrere:     "Bild: <Titel des abgebildeten Eintrags> · <credit>"
// credit = Feld "credit" in events.json, sonst automatisch von Wikimedia,
// sonst "Wikimedia Commons" (bzw. "Eigenes Bild" bei public/bilder/)
const creditLine = computed(() => {
  if (!hero.value) return ''
  const credit = hero.value.credit || imageCredit.value || (imageOwn.value ? 'Eigenes Bild' : 'Wikimedia Commons')
  return single.value ? `Bild: ${credit}` : `Bild: ${hero.value.title} · ${credit}`
})
</script>

<template>
  <article class="card" :class="{ single }">
    <!-- Bildbereich -->
    <div class="media">
      <template v-if="imageUrl && !imageFailed">
        <img class="blur" :src="imageUrl" alt="" aria-hidden="true" loading="lazy" />
        <img class="photo" :class="{ logo: isLogo }" :src="imageUrl" :alt="hero.title" loading="lazy" @error="imageFailed = true" />
      </template>
      <div v-else class="fallback" aria-hidden="true">{{ label.icon }}</div>
      <div class="fade" />
    </div>

    <!-- Textbereich -->
    <div class="content">
      <span class="label">{{ label.icon }} {{ label.text }}</span>

      <template v-if="single">
        <h2>{{ entry.items[0].title }}</h2>
        <p class="text">{{ entry.items[0].text }}</p>
        <a v-if="entry.items[0].source" class="source" :href="entry.items[0].source" target="_blank" rel="noopener">Mehr erfahren ↗</a>
      </template>

      <ul v-else class="list">
        <li v-for="item in entry.items" :key="item.title">
          <h3><span v-if="item.birthday">🎂 </span>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
          <a v-if="item.source" class="source" :href="item.source" target="_blank" rel="noopener">Mehr ↗</a>
        </li>
      </ul>

      <p v-if="imageUrl && !imageFailed" class="credit">{{ creditLine }}</p>
    </div>

    <p v-if="first" class="swipe">↑ wischen</p>
  </article>
</template>

<style scoped>
.card {
  min-height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  padding-top: 112px; /* Platz für die feste Kopfzeile */
  display: flex;
  flex-direction: column;
}

/* ── Bild mit Blur-Auslauf ── */
.media {
  /* --lift: so weit wird das Bild nach oben unter die Kopfzeile gezogen */
  --lift: 72px;
  position: relative;
  height: calc(32dvh + var(--lift));
  margin-top: calc(-1 * var(--lift));
  overflow: hidden;
  flex-shrink: 0;
  /* oben weich ausblenden (transparent → voll sichtbar) */
  mask-image: linear-gradient(transparent, #000 40%);
  -webkit-mask-image: linear-gradient(transparent, #000 40%);
}
.single .media { height: calc(46dvh + var(--lift)); }

.media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.blur { filter: blur(28px) saturate(1.2); transform: scale(1.2); opacity: 0.6; }
.photo {
  /* scharfes Bild blendet nach unten aus → darunter liegt die unscharfe Kopie */
  mask-image: linear-gradient(#000 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(#000 55%, transparent 100%);
}
.photo.logo { object-fit: contain; padding: 22% 20% 18%; }
/* Dunkelmodus: schwarze Logos (Wikipedia, ESC, Olympia-Ring) sonst unsichtbar →
   Helligkeit umkehren, hue-rotate holt die ursprünglichen Farben zurück */
:root[data-theme='dark'] .photo.logo { filter: invert(1) hue-rotate(180deg); }
.fade { position: absolute; inset: auto 0 0 0; height: 45%; background: linear-gradient(transparent, var(--bg)); }

.fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 4.5rem;
  background:
    /* Farben in theme.css (--glow-strong / --glow-soft) */
    radial-gradient(circle at 30% 30%, var(--glow-strong), transparent 60%),
    radial-gradient(circle at 75% 70%, var(--glow-soft), transparent 55%);
}

/* ── Text ── */
.content { padding: 0 1.4rem 2.5rem; margin-top: -1.5rem; position: relative; }

.label {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
}

h2 { margin-top: 0.9rem; font-size: 1.65rem; line-height: 1.2; font-weight: 800; letter-spacing: -0.02em; }
.text { margin-top: 0.7rem; font-size: 1.05rem; line-height: 1.55; }

.list { list-style: none; margin-top: 0.8rem; }
.list li { padding: 0.75rem 0; border-bottom: 1px solid var(--line); }
.list li:last-child { border-bottom: none; }
.list h3 { font-size: 1.05rem; font-weight: 700; }
.list p { margin-top: 0.2rem; font-size: 0.92rem; line-height: 1.45; color: var(--muted); }

.source { display: inline-block; margin-top: 0.5rem; font-size: 0.82rem; color: var(--accent); text-decoration: none; font-weight: 600; }
.list .source { margin-top: 0.25rem; font-size: 0.75rem; }
.credit { margin-top: 1rem; font-size: 0.7rem; color: var(--muted); }

/* Wisch-Hinweis auf der ersten Karte */
.swipe {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--muted);
  animation: bob 1.6s ease-in-out infinite;
}
@keyframes bob { 50% { transform: translate(-50%, -6px); } }
</style>
