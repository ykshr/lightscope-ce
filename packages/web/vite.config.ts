// reference should be here in order to provide test:{} object without an error
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    env: {
      VITE_API_ENDPOINT: 'http://localhost:3000',
      VITE_API_URL: 'http://localhost:3000',
    },
  },
});
