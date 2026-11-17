// ─────────────────────────────────────────────────────────────
// confetti.js – KURZE KONFETTI-EXPLOSION
// Nutzt die kleine Bibliothek "canvas-confetti".
// Wird beim Öffnen (Startscreen) und auf der Abschlusskarte gezündet.
// Hier drehst du für den Feinschliff: Menge, Streuung, Dauer.
// ─────────────────────────────────────────────────────────────
import confetti from 'canvas-confetti'

// Bunt gemischt (null = Standardfarben der Bibliothek)
const COLORS = ['#e4572e', '#f4c430', '#2ec4b6', '#3a86ff', '#8338ec', '#ff006e', '#06d6a0']

export function burst() {
  const base = {
    colors: COLORS,
    disableForReducedMotion: true, // Handy-Einstellung "Bewegung reduzieren" respektieren
    zIndex: 1000,
  }
  // Große Explosion aus der Mitte …
  confetti({ ...base, particleCount: 120, spread: 90, startVelocity: 45, origin: { y: 0.6 } })
  // … plus zwei kleinere Salven von den Seiten, kurz versetzt
  setTimeout(() => {
    confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } })
    confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } })
  }, 250)
}
