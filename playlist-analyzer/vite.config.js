// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
 server: {
  host: '127.0.0.1',
  port: 8000,
  strictPort: true,
  proxy: { '/api': 'http://127.0.0.1:8001' },
},

})
