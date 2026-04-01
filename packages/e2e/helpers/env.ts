// --------------------
// API
// --------------------
const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';
export { API_URL };

const PROXY_URL = process.env.PROXY_URL || 'http://127.0.0.1:3002';
export { PROXY_URL };

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:3000';
export { WEB_URL };

const MOCK_SITE_URL = process.env.MOCK_SITE_URL || 'http://127.0.0.1:8080';
export { MOCK_SITE_URL };
