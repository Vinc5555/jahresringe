<!--
  YearCard.vue – EINE JAHRESKARTE
  Zwei Darstellungen, je nach Anzahl der Einträge:
  - 1 Eintrag (Tagesereignis): großes Bild + Titel + Text
  - 3–5 Einträge (Meilensteine/Geburtstage): kleineres Bild + kompakte Liste
  Das Bild läuft nach unten weich in den Hintergrund aus (Blur + Verlauf).
-->
<script setup>
import { computed, ref, watchEffect } from 'vue'
import { commonsUrl, wikiImage } from '../wikiImage.js'

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

// Titelbild: erster Eintrag, der ein Bild haben darf
// (keine Geburtstage, kein "noImage"). Quelle: Feld "image" oder Wikipedia-Artikel.
const hero = computed(() =>
  props.entry.items.find((i) => !i.birthday && !i.noImage && (i.image || i.source?.includes('de.wikipedia.org/wiki/'))),
)
const imageUrl = ref(null)
const imageFailed = ref(false) // Bild nicht ladbar → Ersatzgrafik

watchEffect(async () => {
  const h = hero.value
  if (!h) return (imageUrl.value = null)
  imageUrl.value = h.image ? commonsUrl(h.image) : await wikiImage(h.source)
})
</script>

<template>
  <article class="card" :class="{ single }">
    <!-- Bildbereich -->
    <div class="media">
      <template v-if="imageUrl && !imageFailed">
        <img class="blur" :src="imageUrl" alt="" aria-hidden="true" loading="lazy" />
        <img class="photo" :src="imageUrl" :alt="hero.title" loading="lazy" @error="imageFailed = true" />
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

      <p v-if="imageUrl && !imageFailed" class="credit">Bild: {{ hero.credit || 'Wikimedia Commons (Details im verlinkten Artikel)' }}</p>
    </div>

    <p v-if="first" class="swipe">↑ wischen</p>
  </article>
</template>

<style scoped>
.card {
  min-height: 100dvh;
  scroll-snap-align: start;
  position: relative;
  padding-top: 112px; /* Platz für die feste Kopfzeile */
  display: flex;
  flex-direction: column;
}

/* ── Bild mit Blur-Auslauf ── */
.media {
  position: relative;
  height: 32dvh;
  overflow: hidden;
  flex-shrink: 0;
}
.single .media { height: 46dvh; }

.media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.blur { filter: blur(28px) saturate(1.2); transform: scale(1.2); opacity: 0.6; }
.photo {
  /* scharfes Bild blendet nach unten aus → darunter liegt die unscharfe Kopie */
  mask-image: linear-gradient(#000 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(#000 55%, transparent 100%);
}
.fade { position: absolute; inset: auto 0 0 0; height: 45%; background: linear-gradient(transparent, var(--bg)); }

.fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 4.5rem;
  background:
    radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    radial-gradient(circle at 75% 70%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 55%);
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
