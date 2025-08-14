import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname),                 // корень фронта — client/
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),       // импорт вида "@/..."
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),     // итоговая папка: client/dist
    emptyOutDir: true,
  },
})
