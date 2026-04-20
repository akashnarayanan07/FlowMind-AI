import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT) || 8080,
    host: '0.0.0.0'
  },
  preview: {
    port: parseInt(process.env.PORT) || 8080,
    host: '0.0.0.0'
  },
  test: {
    // Vitest configuration — runs all *.test.js files in src/tests/
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.{js,jsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
