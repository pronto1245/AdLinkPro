import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // сам файл лежит в client/, поэтому root укажем явно на эту папку
  root: path.resolve(__dirname),
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
