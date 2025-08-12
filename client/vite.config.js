import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path-browserify'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  return {
    base: './',
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        includeAssets: [
          'src/assets/favicon.ico',
          'src/assets/apple-touch-icon-180x180.png',
          'src/assets/maskable-icon-512x512.png'
        ],
        manifest: {
          "name": "Our Shopping List",
          "short_name": "Our Shopping List",
          "icons": [
            {
              "src": "src/assets/pwa-192x192.png",
              "sizes": "192x192",
              "type": "image/png"
            },
            {
              "src": "src/assets/pwa-512x512.png",
              "sizes": "512x512",
              "type": "image/png"
            }
          ],
          "theme_color": "#ffffff",
          "background_color": "#ffffff",
          "display": "standalone"
        },
        devOptions: {
          enabled: true
        }
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173
    }
  }
})
