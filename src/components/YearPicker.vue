<!--
  YearPicker.vue – JAHRESLISTE zum direkten Anspringen
  Öffnet sich beim Tippen auf das Jahr in der Kopfzeile.
-->
<script setup>
defineProps({
  years: Array,    // alle Jahre, z. B. [1936, 1937, …]
  current: Number, // Index des aktuellen Jahres (wird hervorgehoben)
})
defineEmits(['select', 'close'])
</script>

<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="sheet" role="dialog" aria-label="Jahr auswählen">
      <div class="head">
        <h2>Jahr wählen</h2>
        <button @click="$emit('close')" aria-label="Schließen">✕</button>
      </div>
      <div class="grid">
        <button
          v-for="(y, i) in years"
          :key="y"
          :class="{ active: i === current }"
          @click="$emit('select', i)"
        >{{ y }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sheet {
  width: 100%;
  max-width: 480px;
  max-height: 75dvh;
  overflow-y: auto;
  background: var(--surface);
  border-radius: 20px 20px 0 0;
  padding: 1.2rem 1.2rem 2rem;
}
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.head h2 { font-size: 1.1rem; }
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
.grid button {
  padding: 0.65rem 0;
  border-radius: 10px;
  background: var(--bg);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 0.9rem;
}
.grid .active { background: var(--accent); color: #fff; }
</style>
