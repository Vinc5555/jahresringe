<!--
  App.vue – DAS GERÜST DER APP
  Steuert: Startscreen ↔ Zeitleiste, Hell/Dunkel, welches Jahr gerade sichtbar ist,
  und die Jahresliste zum Springen.

  Aufbau:
  - <StartScreen>  Widmung + Button
  - .timeline      senkrechte Wisch-Liste (CSS Scroll-Snap), je Karte ein Jahr
  - <TopBar>       feste Kopfzeile: Datum, Alter, Fortschritt, Hell/Dunkel
  - <YearPicker>   Raster aller Jahre zum direkten Anspringen
-->
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import data from './data/events.json'
import { config } from './config.js'
import StartScreen from './components/StartScreen.vue'
import TopBar from './components/TopBar.vue'
import YearCard from './components/YearCard.vue'
import EndCard from './components/EndCard.vue'
import YearPicker from './components/YearPicker.vue'

// Jahre aufsteigend sortieren (falls in der JSON durcheinander)
const years = [...data.years].sort((a, b) => a.year - b.year)
const endYear = config.birthYear + 90 // Abschlusskarte = 90. Geburtstag

const started = ref(false)      // Startscreen schon verlassen?
const currentIndex = ref(0)     // Index der sichtbaren Karte
const pickerOpen = ref(false)   // Jahresliste offen?
const timeline = ref(null)      // DOM-Element der Wisch-Liste

// Jahr der sichtbaren Karte (letzte Karte = Abschlusskarte)
const currentYear = computed(() =>
  currentIndex.value < years.length ? years[currentIndex.value].year : endYear,
)

// ── Hell/Dunkel ─────────────────────────────────────────────
// Start: gespeicherte Wahl, sonst Einstellung des Handys
function readSavedTheme() {
  try { return localStorage.getItem('theme') } catch { return null }
}
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
const theme = ref(readSavedTheme() || (prefersDark ? 'dark' : 'light'))

function applyTheme() {
  document.documentElement.dataset.theme = theme.value
}
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme()
  try { localStorage.setItem('theme', theme.value) } catch { /* egal */ }
}
applyTheme()

// ── Welche Karte ist sichtbar? ──────────────────────────────
// IntersectionObserver meldet, sobald eine Karte zu >55 % im Bild ist.
function watchCards() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) currentIndex.value = Number(entry.target.dataset.index)
      }
    },
    { root: timeline.value, threshold: 0.55 },
  )
  timeline.value.querySelectorAll('[data-index]').forEach((el) => observer.observe(el))
}

async function start() {
  started.value = true
  await nextTick()   // warten, bis die Zeitleiste im DOM ist
  watchCards()
}

// Zu einer Karte springen (Jahresliste, "Nochmal von vorn")
function goTo(index, smooth = true) {
  pickerOpen.value = false
  const card = timeline.value?.querySelector(`[data-index="${index}"]`)
  card?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
}

onMounted(() => {
  document.title = config.appTitle
})
</script>

<template>
  <StartScreen v-if="!started" @start="start" />

  <template v-else>
    <TopBar
      :year="currentYear"
      :index="currentIndex"
      :total="years.length"
      :theme="theme"
      @toggle-theme="toggleTheme"
      @open-picker="pickerOpen = true"
    />

    <main ref="timeline" class="timeline">
      <YearCard
        v-for="(entry, i) in years"
        :key="entry.year"
        :entry="entry"
        :data-index="i"
        :first="i === 0"
      />
      <EndCard :data-index="years.length" @restart="goTo(0, false)" />
    </main>

    <YearPicker
      v-if="pickerOpen"
      :years="years.map((y) => y.year)"
      :current="currentIndex"
      @select="goTo"
      @close="pickerOpen = false"
    />
  </template>
</template>

<style scoped>
/* Die Wisch-Liste: jede Karte rastet bildschirmfüllend ein */
.timeline {
  height: 100dvh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.timeline::-webkit-scrollbar { display: none; }
</style>
