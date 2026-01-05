import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/REFRIMASTER/', // <--- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ EXACTAMENTE ASÍ
})