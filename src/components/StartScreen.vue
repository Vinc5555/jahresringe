<!--
  StartScreen.vue – WIDMUNG beim Öffnen der App
  Texte kommen aus config.js (name, startSubtitle, startButton).
-->
<script setup>
import { config, dayLabel } from '../config.js'
defineEmits(['start'])
</script>

<template>
  <section class="start">
    <div class="rings" aria-hidden="true">
      <span v-for="n in 6" :key="n" :style="{ '--n': n }" />
    </div>

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
}

/* Dekorative "Jahresringe" im Hintergrund */
.rings { position: absolute; inset: 0; display: grid; place-items: center; z-index: -1; }
.rings span {
  position: absolute;
  width: calc(var(--n) * 90px);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid var(--line);
}

.for { color: var(--muted); font-size: 1rem; margin-bottom: 0.75rem; }
h1 { font-size: 2.6rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
.sub { margin-top: 1rem; color: var(--muted); }

.cta {
  margin-top: 2.5rem;
  background: var(--accent);
  color: #fff;
  padding: 0.95rem 2.2rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1.05rem;
}
.hint { margin-top: 1rem; font-size: 0.8rem; color: var(--muted); }
</style>
