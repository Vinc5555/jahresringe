# Jahresringe

Handy-App (PWA): Zu jedem Lebensjahr seit dem 17.11.1936 ein schönes Ereignis. Nach oben wischen = nächstes Jahr.

## Starten

```bash
npm install       # einmalig: Abhängigkeiten laden
npm run dev       # Entwicklungsserver (Änderungen sofort sichtbar)
npm run build     # fertige App in den Ordner dist/ bauen
```

## Projektaufbau

```
src/
├─ config.js            ← Name, Titel, Geburtsdatum, Texte  (Feinschliff!)
├─ theme.css            ← Farben Hell/Dunkel, Schrift       (Feinschliff!)
├─ data/events.json     ← Alle Inhalte, ein Eintrag pro Jahr (Feinschliff!)
├─ wikiImage.js         ← holt Bilder aus Wikipedia-Artikeln
├─ App.vue              ← Gerüst: Start ↔ Zeitleiste, Hell/Dunkel, Jahr-Erkennung
├─ main.js              ← Startet die App (nichts ändern)
└─ components/
   ├─ StartScreen.vue   ← Widmung + Button
   ├─ TopBar.vue        ← feste Kopfzeile: Datum, Alter, Fortschritt
   ├─ YearCard.vue      ← eine Jahreskarte (Bild + Text/Liste)
   ├─ YearPicker.vue    ← Jahresliste zum Springen
   └─ EndCard.vue       ← Abschlusskarte
vite.config.js          ← Build + PWA (App-Name/Icon fürs Installieren)
public/favicon.svg      ← App-Icon
```

## So funktioniert's

- **Wischen:** `.timeline` in `App.vue` nutzt CSS `scroll-snap-type: y mandatory` – jede Karte rastet bildschirmfüllend ein.
- **Welches Jahr ist sichtbar?** Ein `IntersectionObserver` (App.vue) meldet die Karte, die zu >55 % im Bild ist → Kopfzeile aktualisiert sich.
- **Bilder:** Automatisch das Titelbild des verlinkten de.wikipedia-Artikels (`src/wikiImage.js`). Alternativ ein fester Dateiname von Wikimedia Commons im Feld `image`. Geburtstage und Einträge mit `"noImage": true` bekommen kein Bild (keine Personenfotos). Lädt ein Bild nicht, erscheint eine Ersatzgrafik.
- **Blur-Auslauf:** Das Bild liegt doppelt: einmal unscharf dahinter, einmal scharf mit Maske, die nach unten transparent wird.
- **Hell/Dunkel:** `data-theme="dark"` am `<html>` schaltet die Farbvariablen in `theme.css` um. Die Wahl wird im Browser gespeichert.

## Eintrag in events.json

```json
{ "year": 1969, "type": "day",
  "items": [ { "title": "…", "text": "…", "image": "Datei.jpg", "credit": "Urheber, Lizenz", "source": "https://…" } ] }
```

- `type`: `day` (genau an diesem Tag, 1 Eintrag) · `year` (3–5 Meilensteine) · `birthday` (3–5 bekannte Personen)
- `image`, `credit`, `source` sind optional

## Feinschliff – hier drehst du

| Was | Wo |
|---|---|
| Name, App-Titel, Start-/Endtexte | `src/config.js` |
| Farben | `src/theme.css` (oben) |
| Inhalte | `src/data/events.json` |
| Label-Texte („An diesem Tag“ …) | `src/components/YearCard.vue` → `LABELS` |
| App-Name beim Installieren | `vite.config.js` → `manifest` |

## Veröffentlichen (GitHub Pages)

Automatisch über `.github/workflows/deploy.yml`:
1. Repo → Settings → Pages → Source: **GitHub Actions**
2. Jede Änderung auf `main` baut und veröffentlicht die App neu (Tab „Actions“ zeigt den Fortschritt)
3. Adresse: `https://<benutzername>.github.io/jahresringe/`
4. Am Handy öffnen → Menü → „Zum Startbildschirm hinzufügen“
