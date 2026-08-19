/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * base mora odgovarati imenu repozitorija na GitHub Pagesu, inace stranica
 * trazi /assets/ u korijenu domene i ostaje prazna. U CI-ju se ime cita iz
 * GITHUB_REPOSITORY ("vlasnik/ime"), pa preimenovanje repozitorija nista ne
 * lomi; lokalno i u jednodatotecnom artefaktu ostaje '/'.
 */
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' && repo ? `/${repo}/` : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
})
