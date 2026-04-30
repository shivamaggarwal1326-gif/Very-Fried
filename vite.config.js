import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // --- NEW: Intercepting Supabase API Calls for Offline Sync ---
        runtimeCaching: [
          {
            // We tell the Service Worker to watch for POST requests to your Supabase URL
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
            handler: 'NetworkOnly', // Always try the network first for database writes
            options: {
              backgroundSync: {
                name: 'veryfryd-offline-queue', // The name of the IndexedDB queue
                options: {
                  maxRetentionTime: 24 * 60, // Keep failed orders in the queue for up to 24 hours
                },
              },
            },
          },
        ],
      },
      manifest: {
        name: 'VeryFryd OS',
        short_name: 'VeryFryd',
        description: 'Enterprise Restaurant Operating System',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/vite.svg', 
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})