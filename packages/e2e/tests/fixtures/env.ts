export type ENV = {
  apiURL: string;
  proxyURL: string;
  webURL: string;
  mockSiteURL: string;
};

export const env = {
  apiURL: process.env.API_URL || 'http://127.0.0.1:3001',
  proxyURL: process.env.PROXY_URL || 'http://127.0.0.1:3002',
  webURL: process.env.WEB_URL || 'http://127.0.0.1:3000',
  mockSiteURL: process.env.MOCK_SITE_URL || 'http://127.0.0.1:8080',
};
