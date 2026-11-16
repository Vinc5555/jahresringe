<!--
  TopBar.vue – FESTE KOPFZEILE
  Zeigt: Fortschrittsleiste, "17. November 1969", Alter, "34 / 90", Hell/Dunkel-Schalter.
  Tippen auf das Datum öffnet die Jahresliste.
-->
<script setup>
import { computed } from 'vue'
import { config, dayLabel } from '../config.js'

const props = defineProps({
  year: Number,     // sichtbares Jahr
  index: Number,    // Position der Karte (0 = erste)
  total: Number,    // Anzahl Jahreskarten
  theme: String,    // 'light' | 'dark'
})
defineEmits(['toggle-theme', 'open-picker'])

const age = computed(() => props.year - config.birthYear)
const ageText = computed(() => {
  if (age.value === 0) return 'Dein erster Tag'
  if (props.index >= props.total) return `Du wirst ${age.value}` // Abschlusskarte
  return `Du wurdest ${age.value}`
})

// Fortschritt 0–100 %; Abschlusskarte = voll
const progress = computed(() => Math.min(100, ((props.index + 1) / props.total) * 100))
const counter = computed(() => (props.index < props.total ? `${props.index + 1} / ${props.total}` : '🎉'))
</script>

<template>
  <header class="bar">
    <div class="progress"><span :style="{ width: progress + '%' }" /></div>

    <div class="row">
      <button class="date" @click="$emit('open-picker')" aria-label="Jahr auswählen">
        <span class="day">{{ dayLabel }}</span>
        <span class="year">{{ year }} <small>▾</small></span>
      </button>

      <div class="right">
        <button class="theme" @click="$emit('toggle-theme')" aria-label="Hell/Dunkel umschalten">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
        <span class="counter">{{ counter }}</span>
      </div>
    </div>

    <p class="age">{{ ageText }}</p>
  </header>
</template>

<style scoped>
.bar {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  z-index: 10;
  padding: 0.6rem 1.25rem 0.9rem;
  /* weicher Übergang zum Bild darunter */
  background: linear-gradient(var(--bg) 70%, transparent);
}

.progress { height: 3px; background: var(--line); border-radius: 3px; overflow: hidden; }
.progress span { display: block; height: 100%; background: var(--accent); transition: width 0.4s; }

.row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 0.7rem; }

.date { display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
.day { font-size: 0.85rem; color: var(--muted); font-weight: 500; }
.year { font-size: 2.2rem; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }
.year small { font-size: 0.9rem; color: var(--muted); vertical-align: middle; }

.right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem; }
.theme { font-size: 1.2rem; }
.counter { font-size: 0.8rem; color: var(--muted); font-variant-numeric: tabular-nums; }

.age { margin-top: 0.3rem; font-size: 0.9rem; color: var(--accent); font-weight: 600; }
</style>
