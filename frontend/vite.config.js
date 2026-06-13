import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  // Use different base for local dev and GitHub Pages
  const isDev = command === 'serve'
  return {
    plugins: [react()],
    base: isDev ? '/' : '/E_Commerce_Website/',
    build: {
      chunkSizeWarningLimit: 1000,
    },
    server: {
      host: '0.0.0.0',
      port: 4000,
      strictPort: false,
      allowedHosts: ['localhost', 'admin.localhost'],
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
  }
})
