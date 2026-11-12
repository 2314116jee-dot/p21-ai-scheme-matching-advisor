import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  // Production: VITE_API_BASE_URL env var points to Render backend
  // e.g. https://p21-backend.onrender.com
  define: {
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE_URL || ''),
  },
})
