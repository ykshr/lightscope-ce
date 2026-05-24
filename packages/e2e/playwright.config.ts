import { defineConfig } from '@playwright/test';
import { WEB_URL } from './tests/helpers/env';

export default defineConfig({
  testDir: 'tests',
  globalSetup: 'tests/setup/global-setup.ts',
  testIgnore: '**/*/*.unit.test.ts',
  use: {
    baseURL: WEB_URL,
    storageState: 'storage/auth.json',
  },
});
