<!--
  StartScreen.vue – WIDMUNG beim Öffnen der App
  Texte kommen aus config.js (name, startSubtitle, startButton).
-->
<script setup>
import { onMounted } from 'vue'
import { config, dayLabel } from '../config.js'
import { burst } from '../confetti.js'
import ringsImage from '../assets/jahresringe.webp'
defineEmits(['start'])

// Konfetti, sobald die Startseite erscheint (kurz warten, bis alles gezeichnet ist)
onMounted(() => setTimeout(burst, 400))
</script>

<template>
  <section class="start">
    <!-- Dekorative Jahresringe im Hintergrund (eigenes Bild, transparent) -->
    <img class="rings" :src="ringsImage" alt="" aria-hidden="true" />

    <p class="for">Für {{ config.name }}</p>
    <h1>{{ dayLabel }}<br />{{ config.birthYear }}</h1>
    <p class="sub">{{ config.startSubtitle }}</p>

    <button class="cta" @click="$emit('start')">{{ config.startButton }}</button>
    <p class="hint">Danach nach oben wischen ↑</p>
  </section>
</template>

<style scoped>
.start {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  isolation: isolate; /* Ringe (z-index -1) bleiben sicher hinter dem Text, aber sichtbar */
}

/* Dekorative "Jahresringe" im Hintergrund
   --rings-opacity: wie deutlich die Ringe zu sehen sind (0 = unsichtbar, 1 = voll) */
.rings {
  --rings-opacity: 0.12;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  opacity: var(--rings-opacity);
  pointer-events: none;
  /* zum Rand hin weich ausblenden, damit der Text in der Mitte ruhig bleibt */
  mask-image: radial-gradient(ellipse at center, #000 55%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse at center, #000 55%, transparent 100%);
}
/* Dunkelmodus: schwarze Linien → hell */
:root[data-theme='dark'] .rings { filter: invert(1); --rings-opacity: 0.1; }

/* Schriftgrößen bewusst groß – gut lesbar auch für ältere Augen.
   clamp(min, bevorzugt, max): passt sich der Bildschirmbreite an, bricht nie aus */
.for {
  color: var(--text);
  font-size: clamp(2.6rem, 14vw, 3.6rem);
  font-weight: 600;
  line-height: 1.15;
  margin-bottom: 2.5rem;
}
h1 { font-size: clamp(2.2rem, 11vw, 2.6rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
.sub { margin-top: 1.6rem; font-size: 1.15rem; font-weight: 600; color: var(--muted); }

.cta {
  margin-top: 2.5rem;
  background: var(--accent);
  color: #fff;
  padding: 0.95rem 2.2rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1.2rem;
}
.hint { margin-top: 1rem; font-size: 0.95rem; color: var(--muted); }
</style>
