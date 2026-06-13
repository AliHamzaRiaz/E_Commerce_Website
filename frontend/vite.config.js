import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      writeBundle(options) {
        const src = resolve(__dirname, 'public', '_redirects')
        const dest = resolve(options.dir, '_redirects')
        if (existsSync(src)) {
          copyFileSync(src, dest)
          console.log('Copied _redirects to dist')
        }
      }
    }
  ],
  base: '/',
  build: {
    chunkSizeWarningLimit: 1000,
  },
  publicDir: 'public',
  server: {
    host: '0.0.0.0',
    port: 4000,
    strictPort: false,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
