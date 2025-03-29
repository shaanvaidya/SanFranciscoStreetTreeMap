import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SanFranciscoStreetTreeMap/',
  server: {
    host: true, // so it binds to your local IP
    allowedHosts: true // ⬅️ allow all hostnames like ngrok
  }
})
