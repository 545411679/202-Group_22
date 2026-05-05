import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 5200,
    strictPort: true,
    fs: { strict: false },
    proxy: {
      '/api/': { target: 'http://localhost:8080', changeOrigin: true }
    }
  }
})
