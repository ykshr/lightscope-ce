import { AlgorithmTypes } from 'hono/jwt';

const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';
const PROXY_URL = process.env.PROXY_URL || 'http://127.0.0.1:3002';
const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:3000';
const MOCK_SITE_URL = process.env.MOCK_SITE_URL || 'http://127.0.0.1:8080';

export { API_URL, MOCK_SITE_URL, PROXY_URL, WEB_URL };

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || AlgorithmTypes.HS256;

export { JWT_ALGORITHM, JWT_SECRET };

const USER_EMAIL = process.env.USER_EMAIL || 'e2e@example.com';
const USER_PASSWORD = process.env.USER_PASSWORD || 'password123';
const USER_NAME = process.env.USER_NAME || 'E2E User';
const ORG_NAME = process.env.ORG_NAME || 'Test Org';
const ORG_SLUG = process.env.ORG_SLUG || 'test-org';

export { ORG_NAME, ORG_SLUG, USER_EMAIL, USER_NAME, USER_PASSWORD };
