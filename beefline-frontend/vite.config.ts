/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'form-vendor': ['react-hook-form'],
          'http-vendor': ['axios'],
        },
      },
    },
    // Enable code splitting
    chunkSizeWarningLimit: 1000,
    // Optimize assets
    assetsInlineLimit: 4096, // 4kb - inline small assets as base64
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    pool: 'vmThreads',
    server: {
      deps: {
        inline: [
          'react-router',
          'react-router-dom'
        ]
      }
    }
  },
})