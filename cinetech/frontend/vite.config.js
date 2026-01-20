// Configuration Vite pour React 18+
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Active le plugin React (Fast Refresh, JSX)
export default defineConfig({
  plugins: [react()],
})
