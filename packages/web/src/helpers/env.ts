// --------------------
// API
// --------------------
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
export { API_URL };

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://127.0.0.1:3002';
export { PROXY_URL };

// --------------------
// Auth
// --------------------
const IS_GOOGLE_AUTH_ENABLED = import.meta.env.VITE_AUTH_GOOGLE_ENABLED === 'true';
export { IS_GOOGLE_AUTH_ENABLED };

const IS_APPLE_AUTH_ENABLED = import.meta.env.VITE_AUTH_APPLE_ENABLED === 'true';
export { IS_APPLE_AUTH_ENABLED };

const IS_MICROSOFT_AUTH_ENABLED = import.meta.env.VITE_AUTH_MICROSOFT_ENABLED === 'true';
export { IS_MICROSOFT_AUTH_ENABLED };
