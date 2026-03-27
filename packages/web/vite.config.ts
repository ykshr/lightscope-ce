// reference should be here in order to provide test:{} object without an error
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
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
      VITE_API_URL: 'http://localhost:3001',
      VITE_PROXY_URL: 'http://localhost:3002',
    },
  },
});
