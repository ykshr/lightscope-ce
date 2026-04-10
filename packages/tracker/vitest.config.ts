import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': 'src',
    },
    exclude: ['dist/**', 'node_modules/**'],
  },
});
