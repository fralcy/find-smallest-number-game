import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'game-icon.svg'],
      manifest: {
        name: 'Find the Smallest Number',
        short_name: 'Number Game',
        description: 'A fun game to find the smallest number',
        theme_color: '#4A90E2',
        start_url: '/find-smallest-number-game/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide' // Cho desktop
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow' // Cho mobile
          }
        ],
        display: 'standalone',
        background_color: '#ffffff',
        orientation: 'landscape',
        categories: ['games', 'education', 'entertainment']
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/find-smallest-number-game/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: new RegExp('^https://username\\.github\\.io/find-smallest-number-game/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-content'
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  base: '/find-smallest-number-game/'
})