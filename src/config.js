// ─────────────────────────────────────────────────────────────
// config.js – ZENTRALE EINSTELLUNGEN
// Hier drehst du für den Feinschliff: Name, Titel, Geburtsdatum,
// Texte auf Start- und Abschlusskarte.
// ─────────────────────────────────────────────────────────────

export const config = {
  // App-Titel (erscheint auf dem Startscreen und im Browser-Tab)
  appTitle: 'Jahresringe',

  // Name der beschenkten Person (für die Widmung)
  name: '[Name]',

  // Geburtstag: Tag, Monat (1–12), Jahr
  birthDay: 17,
  birthMonth: 11,
  birthYear: 1936,

  // Startscreen
  startSubtitle: '90 Jahre · 90 Geschichten',
  startButton: "Los geht's",

  // Abschlusskarte (erscheint nach dem letzten Jahr)
  endTitle: 'Alles Gute zum 90.!',
  endText: 'Neunzig Jahre voller Geschichten – und deine schönste schreibst du selbst.',
  endButton: 'Nochmal von vorn',

  // Bildbreite in Pixeln (kleiner = weniger mobile Daten)
  imageWidth: 600,
}

// Monatsnamen für die Datumsanzeige
export const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

// "17. November" – wird oben in der Kopfzeile angezeigt
export const dayLabel = `${config.birthDay}. ${MONTHS[config.birthMonth - 1]}`
