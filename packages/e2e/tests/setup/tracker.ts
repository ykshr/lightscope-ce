import { env } from '@/helpers/env';
import { sign } from 'hono/jwt';
import path from 'path';
import { Page } from 'playwright';

export async function generateToken(organizationId: string, origin: string) {
  const payload = { organizationId, origin };
  const token = await sign(payload, env.jwtSecret, env.jwtAlgorithm as any);
  return token;
}

export async function injectTracker(page: Page, organizationId: string, origin: string) {
  const token = await generateToken(organizationId, origin);
  await page.addScriptTag({
    path: path.resolve(__dirname, '../../../tracker/dist/browser.js'),
    'data-token': token,
    'data-endpoint': `${env.proxyURL}/events`,
  } as any);
}
