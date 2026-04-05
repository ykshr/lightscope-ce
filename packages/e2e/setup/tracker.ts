import { JWT_ALGORITHM, JWT_SECRET, PROXY_URL } from '@/helpers/env';
import fs from 'fs';
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

  const scriptPath = path.resolve(__dirname, '../../tracker/dist/browser.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

  await page.evaluate(
    ({ scriptContent, token, endpoint }) => {
      const script = document.createElement('script');
      script.textContent = scriptContent;

      script.setAttribute('data-token', token);
      script.setAttribute('data-endpoint', endpoint);

      document.head.appendChild(script);
    },
    {
      scriptContent,
      token,
      endpoint: `${PROXY_URL}/events`,
    }
  );
}
