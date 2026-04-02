import { JWT_ALGORITHM, JWT_SECRET, PROXY_URL } from '@/helpers/env';
import { sign } from 'hono/jwt';
import path from 'path';
import { Page } from 'playwright';

export async function generateToken(organizationId: string, origin: string) {
  const payload = { organizationId, origin };
  const token = await sign(payload, JWT_SECRET, JWT_ALGORITHM as any);
  return token;
}

export async function injectTracker(page: Page, organizationId: string, origin: string) {
  const token = await generateToken(organizationId, origin);
  await page.addScriptTag({
    path: path.resolve(__dirname, '../../../tracker/dist/browser.js'),
    'data-token': token,
    'data-endpoint': `${PROXY_URL}/events`,
  } as any);
}
