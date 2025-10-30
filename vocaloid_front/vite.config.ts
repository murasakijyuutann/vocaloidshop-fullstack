import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8081',
      // Auth endpoints live at /auth on the backend
      '/auth': 'http://localhost:8081',
    },
  },
})
