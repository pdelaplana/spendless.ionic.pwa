/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@providers': resolve(__dirname, './src/providers'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@theme': resolve(__dirname, './src/theme'),
      '@i18n': resolve(__dirname, './src/i18n'),
    },
  },
});
