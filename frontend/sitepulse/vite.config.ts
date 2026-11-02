import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4758,
    proxy: {
      // Forward API calls to the NestJS backend during development.
      '/api': {
        target: 'http://localhost:6542',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
