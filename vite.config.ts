/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base mora odgovarati imenu repozitorija na GitHub Pagesu (https://<user>.github.io/Prehrana/)
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Prehrana/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
})
