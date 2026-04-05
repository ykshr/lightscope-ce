import { WEB_URL } from '@/helpers/env';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  globalSetup: 'setup/global-setup.ts',
  use: {
    baseURL: WEB_URL,
    storageState: 'storage/auth.json',
  },
});
