import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '@/tests',
  globalSetup: '@/tests/setup/global-setup.ts',
  use: {
    storageState: 'storage/auth.json',
  },
});
