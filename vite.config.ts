import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],        globIgnores: ['**/eMotion background image.png'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapbox-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // <== 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'eMotion Trek App',
        short_name: 'eMotion',
        description: 'Advanced Topographic Trekking App',
        theme_color: '#FF4500',
        background_color: '#1C1C1E',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
