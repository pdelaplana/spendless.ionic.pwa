import react from '@vitejs/plugin-react';
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/vite.config.ts',
        'dist/',
        'coverage/',
      ],
    },
    // Mock Firebase and external services
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@providers': '/src/providers',
      '@infrastructure': '/src/infrastructure',
      '@theme': '/src/theme',
      '@i18n': '/src/i18n',
    },
  },
});
