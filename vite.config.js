// vite.config.js – BUILD-EINSTELLUNGEN
// - base './'  → App funktioniert in jedem Unterordner (z. B. GitHub Pages)
// - VitePWA    → macht die App installierbar und offline-fähig
//                (Name/Farben des App-Icons stehen unten im "manifest")
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Jahresringe',
        short_name: 'Jahresringe',
        lang: 'de',
        display: 'standalone',
        background_color: '#fafaf7',
        theme_color: '#fafaf7',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      workbox: {
        // Wikipedia-Abfragen und Bilder nach dem ersten Laden im Handy speichern (spart Daten)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/((commons|upload)\.wikimedia\.org|de\.wikipedia\.org\/api)\//,
            handler: 'CacheFirst',
            options: { cacheName: 'bilder', expiration: { maxEntries: 300 } },
          },
        ],
      },
    }),
  ],
})
