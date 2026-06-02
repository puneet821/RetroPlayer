import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'vinyl_splatter.png'],
      manifest: {
        name: 'Retro Web App',
        short_name: 'Retro',
        description: 'Retro Web Application',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'vinyl_splatter.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'vinyl_splatter.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: true,
    cors: true
  }
})
