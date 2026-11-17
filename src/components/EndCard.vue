<!--
  EndCard.vue – ABSCHLUSSKARTE nach dem letzten Jahr
  Texte kommen aus config.js (endTitle, endText, endButton).
-->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { config } from '../config.js'
import { burst } from '../confetti.js'
defineEmits(['restart'])

// Konfetti, sobald die Abschlusskarte zu mehr als der Hälfte sichtbar ist
// (jedes Mal, wenn man dort ankommt)
const card = ref(null)
let observer
onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) burst() },
    { threshold: 0.6 },
  )
  observer.observe(card.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section ref="card" class="end">
    <p class="emoji" aria-hidden="true">🎉</p>
    <h2>{{ config.endTitle }}</h2>
    <p class="text">{{ config.endText }}</p>
    <button class="cta" @click="$emit('restart')">{{ config.endButton }}</button>
  </section>
</template>

<style scoped>
.end {
  min-height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 2rem 2rem;
}
.emoji { font-size: 4rem; }
h2 { margin-top: 1rem; font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
.text { margin-top: 1rem; color: var(--muted); line-height: 1.5; max-width: 30ch; }
.cta {
  margin-top: 2rem;
  border: 2px solid var(--accent);
  color: var(--accent);
  padding: 0.8rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
}
</style>
